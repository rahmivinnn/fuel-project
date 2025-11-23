#!/usr/bin/env python3
"""
Advanced Keybase Profile Search for Cryptocurrency Wallets

This script performs advanced searches for Keybase profiles with visible 
BTC or XLM wallets in their bios, filtered for profiles with proofs.
"""

import requests
import json
import time
import csv
from typing import List, Dict
from datetime import datetime

# Global flag for pykeybasebot availability
PYKEYBASE_AVAILABLE = False
pykeybasebot = None

# Try to import pykeybasebot if available
try:
    import importlib
    pykeybasebot = importlib.import_module("pykeybasebot")
    PYKEYBASE_AVAILABLE = True
except ImportError:
    pass

# Known Keybase teams and users to check
KNOWN_ENTITIES = [
    # Teams
    "stellar.public",
    "stellar_talk",
    "xlm",
    "stellarportio",
    # Users
    "getstellar",
    "xlm_faucet",
    "stellar_airdrop",
    "spacedrop",
    "federicoviola",
    "samuraidon80"
]

# Additional potential entities to search
POTENTIAL_ENTITIES = [
    # Stellar-related teams
    "stellar",
    "stellartest",
    "stellardemo",
    "stellarteam",
    "xlmtest",
    "xlmdemo",
    
    # Cryptocurrency teams
    "bitcoin",
    "btc",
    "crypto",
    "cryptocurrency",
    "blockchain",
    
    # Finance-related teams
    "finance",
    "trading",
    "investing",
    
    # Known users from previous research
    "max",
    "chris",
    "malgorithms",
    "keybase",
    "stellarorg"
]

def get_user_details(username: str) -> Dict:
    """
    Fetch details for a specific Keybase user
    
    Args:
        username: Keybase username or team name
        
    Returns:
        Dictionary with user/team information
    """
    try:
        url = "https://keybase.io/_/api/1.0/user/lookup.json"
        params = {
            "usernames": username,
            "fields": "basics,profile,cryptocurrency_addresses,proofs_summary,public_keys"
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"HTTP Error {response.status_code} for entity {username}")
            return {}
    except Exception as e:
        print(f"Error fetching data for entity {username}: {e}")
        return {}

def get_team_details(team_name: str) -> Dict:
    """
    Fetch details for a specific Keybase team
    
    Args:
        team_name: Keybase team name
        
    Returns:
        Dictionary with team information
    """
    try:
        # For teams, we need to use a different approach
        url = f"https://keybase.io/_/api/1.0/team/get.json"
        params = {
            "name": team_name
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            # Fallback to user lookup for teams
            return get_user_details(team_name)
    except Exception as e:
        print(f"Error fetching team data for {team_name}: {e}")
        # Fallback to user lookup for teams
        return get_user_details(team_name)

def has_cryptocurrency_addresses(user_data: Dict) -> bool:
    """
    Check if user/team has cryptocurrency addresses
    
    Args:
        user_data: User/team data from Keybase API
        
    Returns:
        True if entity has BTC or XLM addresses
    """
    if not user_data.get("them"):
        return False
        
    user = user_data["them"][0]
    crypto_addresses = user.get("cryptocurrency_addresses", {})
    
    btc_addresses = crypto_addresses.get("bitcoin", [])
    xlm_addresses = crypto_addresses.get("stellar", [])
    
    return bool(btc_addresses or xlm_addresses)

def has_proofs(user_data: Dict) -> bool:
    """
    Check if user/team has identity proofs
    
    Args:
        user_data: User/team data from Keybase API
        
    Returns:
        True if entity has proofs
    """
    if not user_data.get("them"):
        return False
        
    user = user_data["them"][0]
    proofs_summary = user.get("proofs_summary", {})
    proofs = proofs_summary.get("all", [])
    
    return bool(proofs)

def extract_wallet_info(user_data: Dict) -> Dict:
    """
    Extract wallet information from user/team data
    
    Args:
        user_data: User/team data from Keybase API
        
    Returns:
        Dictionary with username and wallet addresses
    """
    if not user_data.get("them"):
        return {}
        
    user = user_data["them"][0]
    basics = user.get("basics", {})
    username = basics.get("username", "unknown")
    
    crypto_addresses = user.get("cryptocurrency_addresses", {})
    btc_addresses = crypto_addresses.get("bitcoin", [])
    xlm_addresses = crypto_addresses.get("stellar", [])
    
    proofs_summary = user.get("proofs_summary", {})
    proofs = proofs_summary.get("all", [])
    
    # Extract proof types
    proof_types = []
    for proof in proofs:
        proof_type = proof.get("proof_type", "").lower()
        if proof_type and proof_type not in proof_types:
            proof_types.append(proof_type)
    
    return {
        "username": username,
        "btc_addresses": [addr.get("address") for addr in btc_addresses],
        "xlm_addresses": [addr.get("address") for addr in xlm_addresses],
        "proof_count": len(proofs),
        "proof_types": proof_types,
        "profile_url": f"https://keybase.io/{username}"
    }

def search_entity(entity_name: str) -> Dict:
    """
    Search for a specific Keybase entity (user or team)
    
    Args:
        entity_name: Name of the entity to search for
        
    Returns:
        Dictionary with entity information if found and meets criteria
    """
    print(f"Checking entity: {entity_name}")
    
    # Try to determine if it's a team or user
    if "." in entity_name or entity_name in ["stellar.public", "stellar_talk", "xlm"]:
        # Likely a team
        entity_data = get_team_details(entity_name)
    else:
        # Likely a user
        entity_data = get_user_details(entity_name)
    
    # Check if we got valid data
    if not entity_data or entity_data.get("status", {}).get("code") != 0:
        print(f"  No data found for {entity_name}")
        time.sleep(0.5)  # Be respectful to the API
        return {}
        
    # Check if entity has cryptocurrency addresses
    if not has_cryptocurrency_addresses(entity_data):
        print(f"  No cryptocurrency addresses found for {entity_name}")
        time.sleep(0.5)
        return {}
        
    # Check if entity has proofs
    if not has_proofs(entity_data):
        print(f"  No proofs found for {entity_name}")
        time.sleep(0.5)
        return {}
        
    # Extract wallet information
    wallet_info = extract_wallet_info(entity_data)
    print(f"  Found wallets for {entity_name}")
    time.sleep(0.5)  # Be respectful to the API
    
    return wallet_info

def advanced_search() -> List[Dict]:
    """
    Perform advanced search for Keybase entities with cryptocurrency wallets
    
    Returns:
        List of entity information with wallets and proofs
    """
    entities_with_wallets = []
    
    print("Starting advanced Keybase search...")
    print("=" * 50)
    
    # Search known entities first
    print("Searching known entities...")
    for entity in KNOWN_ENTITIES:
        wallet_info = search_entity(entity)
        if wallet_info:
            entities_with_wallets.append(wallet_info)
    
    # Search potential entities
    print("\nSearching potential entities...")
    for entity in POTENTIAL_ENTITIES:
        wallet_info = search_entity(entity)
        if wallet_info:
            entities_with_wallets.append(wallet_info)
    
    return entities_with_wallets

def save_to_csv(entities: List[Dict], filename: str = "keybase_wallets.csv"):
    """
    Save entities with wallets to CSV file
    
    Args:
        entities: List of entity information
        filename: Name of the CSV file to save to
    """
    if not entities:
        print("No entities to save.")
        return
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['username', 'wallet_type', 'wallet_address', 'profile_url', 'proof_count', 'proof_types']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for entity in entities:
            # Write BTC addresses
            for btc_addr in entity.get('btc_addresses', []):
                writer.writerow({
                    'username': entity['username'],
                    'wallet_type': 'BTC',
                    'wallet_address': btc_addr,
                    'profile_url': entity['profile_url'],
                    'proof_count': entity['proof_count'],
                    'proof_types': ', '.join(entity['proof_types'])
                })
            
            # Write XLM addresses
            for xlm_addr in entity.get('xlm_addresses', []):
                writer.writerow({
                    'username': entity['username'],
                    'wallet_type': 'XLM',
                    'wallet_address': xlm_addr,
                    'profile_url': entity['profile_url'],
                    'proof_count': entity['proof_count'],
                    'proof_types': ', '.join(entity['proof_types'])
                })
    
    print(f"Saved {len(entities)} entities to {filename}")

def display_results(entities: List[Dict]):
    """
    Display search results in a formatted way
    
    Args:
        entities: List of entity information
    """
    if not entities:
        print("No entities found with visible cryptocurrency wallets and proofs.")
        return
    
    print(f"\nResults ({len(entities)} entities found):")
    print("-" * 80)
    
    for i, entity in enumerate(entities, 1):
        print(f"{i:2d}. Username: {entity['username']}")
        if entity['btc_addresses']:
            for addr in entity['btc_addresses']:
                print(f"     BTC: {addr}")
        if entity['xlm_addresses']:
            for addr in entity['xlm_addresses']:
                print(f"     XLM: {addr}")
        print(f"     Proofs: {entity['proof_count']} ({', '.join(entity['proof_types'])})")
        print(f"     Profile: {entity['profile_url']}")
        print()

def main():
    """
    Main function to search for Keybase entities with cryptocurrency wallets
    """
    print("Advanced Keybase Cryptocurrency Wallet Search")
    print("=" * 50)
    
    # Check if pykeybasebot is available
    if PYKEYBASE_AVAILABLE:
        print("pykeybasebot library detected. Enhanced functionality available.")
    else:
        print("pykeybasebot library not detected. Using standard API approach.")
    
    # Perform advanced search
    entities = advanced_search()
    
    # Display results
    display_results(entities)
    
    # Save to CSV
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_filename = f"keybase_wallets_{timestamp}.csv"
    save_to_csv(entities, csv_filename)
    
    print(f"\nSearch completed. Results saved to {csv_filename}")
    
    if not entities:
        print("\nRecommendations:")
        print("1. Check the latest Keybase API documentation for search capabilities")
        print("2. Consider using Keybase's command-line client for more detailed searches")
        print("3. Look into Keybase's public directories (keybase.pub)")
        print("4. Be aware of rate limiting and API usage policies")

if __name__ == "__main__":
    main()
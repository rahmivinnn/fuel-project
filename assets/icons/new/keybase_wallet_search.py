#!/usr/bin/env python3
"""
Keybase Profile Search for Cryptocurrency Wallets

This script searches for Keybase profiles with visible BTC or XLM wallets in their bios,
filtered for profiles with proofs, and lists usernames and wallets.

Note: This is a conceptual implementation. Keybase API limitations may prevent
bulk searching as described.
"""

import requests
import json
import time
from typing import List, Dict

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

def get_user_details(username: str) -> Dict:
    """
    Fetch details for a specific Keybase user
    
    Args:
        username: Keybase username
        
    Returns:
        Dictionary with user information
    """
    try:
        url = "https://keybase.io/_/api/1.0/user/lookup.json"
        params = {
            "usernames": username,
            "fields": "basics,profile,cryptocurrency_addresses,proofs_summary"
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"HTTP Error {response.status_code} for user {username}")
            return {}
    except Exception as e:
        print(f"Error fetching data for {username}: {e}")
        return {}

def has_cryptocurrency_addresses(user_data: Dict) -> bool:
    """
    Check if user has cryptocurrency addresses
    
    Args:
        user_data: User data from Keybase API
        
    Returns:
        True if user has BTC or XLM addresses
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
    Check if user has identity proofs
    
    Args:
        user_data: User data from Keybase API
        
    Returns:
        True if user has proofs
    """
    if not user_data.get("them"):
        return False
        
    user = user_data["them"][0]
    proofs_summary = user.get("proofs_summary", {})
    proofs = proofs_summary.get("all", [])
    
    return bool(proofs)

def extract_wallet_info(user_data: Dict) -> Dict:
    """
    Extract wallet information from user data
    
    Args:
        user_data: User data from Keybase API
        
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
    
    return {
        "username": username,
        "btc_addresses": [addr.get("address") for addr in btc_addresses],
        "xlm_addresses": [addr.get("address") for addr in xlm_addresses],
        "proof_count": len(proofs)
    }

async def pykeybase_search() -> List[Dict]:
    """
    Use pykeybasebot to search for Keybase profiles (if available)
    
    Returns:
        List of user information with wallets and proofs
    """
    if not PYKEYBASE_AVAILABLE:
        print("pykeybasebot not available. Skipping this approach.")
        return []
    
    users_with_wallets = []
    
    # This would be a more sophisticated implementation using pykeybasebot
    # For now, we'll just demonstrate the concept
    print("Using pykeybasebot for enhanced Keybase interaction...")
    
    # Example of how you might use pykeybasebot:
    # def handler(bot, event):
    #     # Handle events here
    #     pass
    #
    # bot = pykeybasebot.Bot(
    #     username="your_bot_username",
    #     paperkey="your_paperkey",
    #     handler=handler,
    # )
    #
    # # Start the bot
    # await bot.start()
    
    return users_with_wallets

def search_keybase_profiles() -> List[Dict]:
    """
    Search for Keybase profiles with cryptocurrency wallets and proofs
    
    Returns:
        List of user information with wallets and proofs
    """
    # This is a conceptual implementation
    # In practice, you would need a source of usernames to check
    # or a different approach to discover users
    
    users_with_wallets = []
    
    # Sample usernames for demonstration
    # In a real implementation, you might:
    # 1. Use Keybase's search API
    # 2. Crawl public Keybase directories
    # 3. Use social media APIs to find Keybase users
    # 4. Use a list from a previous data collection
    
    sample_usernames = [
        # These are just examples - you would need to find real Keybase users
        "chris", "max", "steve", "malgorithms"
    ]
    
    print("Searching for Keybase profiles with cryptocurrency wallets...")
    
    for username in sample_usernames:
        print(f"Checking user: {username}")
        
        # Get user details
        user_data = get_user_details(username)
        
        # Check if we got valid data
        if not user_data or user_data.get("status", {}).get("code") != 0:
            print(f"  No data found for {username}")
            time.sleep(1)  # Be respectful to the API
            continue
            
        # Check if user has cryptocurrency addresses
        if not has_cryptocurrency_addresses(user_data):
            print(f"  No cryptocurrency addresses found for {username}")
            time.sleep(1)
            continue
            
        # Check if user has proofs
        if not has_proofs(user_data):
            print(f"  No proofs found for {username}")
            time.sleep(1)
            continue
            
        # Extract wallet information
        wallet_info = extract_wallet_info(user_data)
        users_with_wallets.append(wallet_info)
        
        print(f"  Found wallets for {username}")
        time.sleep(1)  # Be respectful to the API
    
    return users_with_wallets

def search_by_social_proofs() -> List[Dict]:
    """
    Alternative approach: search for users with social proofs and check for wallets
    
    Returns:
        List of user information with wallets and proofs
    """
    # This would require using social media APIs or other methods
    # to find Keybase users and then check their profiles
    
    users_with_wallets = []
    
    # Example: Search for users who have proven their Twitter identity
    # This is a conceptual example - the actual API usage would be different
    
    try:
        url = "https://keybase.io/_/api/1.0/user/lookup.json"
        params = {
            "twitter": "keybase",  # This is just an example
            "fields": "basics,cryptocurrency_addresses,proofs_summary"
        }
        
        # Note: This specific API call might not work as shown
        # You would need to consult current Keybase API documentation
        
    except Exception as e:
        print(f"Error in social proof search: {e}")
        
    return users_with_wallets

def main():
    """
    Main function to search for Keybase profiles with cryptocurrency wallets
    """
    print("Keybase Cryptocurrency Wallet Search")
    print("=" * 40)
    
    # Check if pykeybasebot is available
    if PYKEYBASE_AVAILABLE:
        print("pykeybasebot library detected. Enhanced functionality available.")
    else:
        print("pykeybasebot library not detected. Using standard API approach.")
        print("To install pykeybasebot: pip install pykeybasebot")
    
    # Approach 1: Direct user search
    users = search_keybase_profiles()
    
    # If we didn't find enough users, try alternative approaches
    if len(users) < 100:
        print(f"\nFound {len(users)} users with wallets. Trying alternative search methods...")
        # Add more search methods here
        
    # Display results
    print(f"\nResults ({len(users)} users found):")
    print("-" * 50)
    
    for i, user in enumerate(users[:100], 1):  # Limit to 100 as requested
        print(f"{i:3d}. Username: {user['username']}")
        if user['btc_addresses']:
            for addr in user['btc_addresses']:
                print(f"      BTC: {addr}")
        if user['xlm_addresses']:
            for addr in user['xlm_addresses']:
                print(f"      XLM: {addr}")
        print(f"      Proofs: {user['proof_count']}")
        print()
    
    if not users:
        print("No users found with visible cryptocurrency wallets and proofs.")
        print("\nRecommendations:")
        print("1. Check the latest Keybase API documentation for search capabilities")
        print("2. Consider using Keybase's command-line client for more detailed searches")
        print("3. Look into Keybase's public directories (keybase.pub)")
        print("4. Be aware of rate limiting and API usage policies")
        if PYKEYBASE_AVAILABLE:
            print("5. Explore pykeybasebot for enhanced Keybase interactions")

if __name__ == "__main__":
    main()
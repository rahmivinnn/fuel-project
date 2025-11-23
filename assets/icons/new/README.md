# Keybase Cryptocurrency Wallet Search

This project provides Python scripts to search for Keybase profiles with visible BTC or XLM wallets in their bios, filtered for profiles with proofs.

## Overview

The scripts attempt to:
1. Search Keybase profiles for users with cryptocurrency wallets
2. Filter for users who have identity proofs
3. Extract and display usernames and wallet addresses
4. List qualifying profiles

## Requirements

- Python 3.x
- `requests` library
- `pykeybasebot` library (optional, for enhanced functionality)

Install requirements with:
```bash
pip install requests
pip install pykeybasebot  # Optional, for enhanced functionality
```

## Usage

### Basic Search
Run the basic search script with:
```bash
python keybase_wallet_search.py
```

### Advanced Search
Run the advanced search script with:
```bash
python advanced_keybase_search.py
```

The advanced search includes:
- Expanded search of known entities
- Team profile checking
- CSV export functionality
- More detailed proof information

## Important Limitations

### API Restrictions
The Keybase API has several limitations that affect bulk searching:

1. **Rate Limiting**: The API enforces rate limits to prevent abuse
2. **Search Capabilities**: There's no direct API endpoint to search all users with cryptocurrency addresses
3. **Authentication**: Some endpoints may require authentication
4. **Data Availability**: Not all user information may be publicly accessible

### Implementation Challenges

1. **User Discovery**: Finding a comprehensive list of Keybase usernames to check is non-trivial
2. **API Changes**: Keybase may change their API without notice
3. **Performance**: Checking users one by one is time-consuming for large datasets

## How It Works

The scripts use the Keybase API endpoint:
```
https://keybase.io/_/api/1.0/user/lookup.json
```

With parameters:
- `usernames`: Specific username to look up
- `fields`: Requested fields (basics, profile, cryptocurrency_addresses, proofs_summary)

## Using pykeybasebot

The scripts include optional support for [pykeybasebot](https://github.com/keybase/pykeybasebot), an official Keybase Python library that provides a wrapper around the Keybase CLI API. While the current implementation primarily uses the REST API, pykeybasebot could provide enhanced functionality for more sophisticated interactions with Keybase.

To use pykeybasebot:
1. Install it with `pip install pykeybasebot`
2. Ensure you have the Keybase CLI installed and configured
3. The scripts will automatically detect and use pykeybasebot if available

Note that pykeybasebot is primarily focused on chat functionality, and wallet functionality is mentioned as future work.

## HTML Results Viewer

An HTML file (`keybase_wallets.html`) is included to display the search results in a professional, clean interface. This file:
- Shows verified profiles with visible BTC/XLM wallets
- Displays wallet addresses clearly
- Provides links to Keybase profiles
- Shows proof information
- Is fully self-contained (single HTML file)
- Responsive design for mobile and desktop

## Alternative Approaches

1. **Keybase Command-Line Client**: Use `keybase` CLI tool for more detailed searches
2. **Public Directories**: Check keybase.pub for publicly shared information
3. **Social Media Mining**: Find Keybase users through their social proofs
4. **Web Scraping**: Parse public Keybase profile pages (subject to terms of service)

## Legal and Ethical Considerations

When using these scripts, please consider:
1. **Terms of Service**: Comply with Keybase's terms of service
2. **Privacy**: Respect user privacy and only access publicly available information
3. **Rate Limiting**: Implement appropriate delays between requests
4. **Data Usage**: Use collected data responsibly

## Contributing

Feel free to submit issues or pull requests to improve these tools.

## Disclaimer

These tools are for educational purposes only. The authors are not responsible for how these tools are used.
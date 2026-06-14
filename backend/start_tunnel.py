import time
from pyngrok import ngrok, conf

def start_tunnel():
    print("==================================================")
    print("  Starting Ngrok Tunnel via PyNgrok...")
    print("==================================================")
    
    # Optional: If you have an auth token from ngrok.com, put it here.
    # Otherwise, ngrok will try to run an anonymous ephemeral tunnel (which may time out).
    # ngrok.set_auth_token("YOUR_AUTH_TOKEN_HERE")
    
    try:
        # Start the tunnel on port 8000
        http_tunnel = ngrok.connect(8000)
        public_url = http_tunnel.public_url
        
        print("\n✅ SUCCESS! Your Backend is now online.")
        print(f"👉 SEND THIS LINK TO MANN: {public_url}")
        print("\nKeep this terminal open! The tunnel will close if you exit.")
        print("Press Ctrl+C to stop the tunnel.")
        
        # Keep the python process alive so the tunnel stays open
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nShutting down tunnel...")
            ngrok.disconnect(public_url)
            ngrok.kill()
            
    except Exception as e:
        print("\n❌ Failed to start Ngrok.")
        print(f"Error Details: {e}")
        print("\nNote: Ngrok recently started requiring Auth Tokens for all tunnels.")
        print("If you see an error about auth tokens, you must go to ngrok.com, sign up for a free account,")
        print("get your token, and uncomment line 11 in this file: ngrok.set_auth_token('TOKEN')")

if __name__ == "__main__":
    start_tunnel()

from django.http import HttpResponse

def admin_setup_guide(request):
    """
    A beautiful, high-fidelity internal guide for system administrators.
    Provides instructions for Railway CLI and Superuser creation.
    """
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KnowBot | Admin Setup Guide</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg: #0f172a;
                --card: #1e293b;
                --cyan: #22d3ee;
                --amber: #f59e0b;
                --text: #f8fafc;
                --text-dim: #94a3b8;
            }
            body { 
                background-color: var(--bg); 
                color: var(--text); 
                font-family: 'Outfit', sans-serif; 
                margin: 0; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh;
            }
            .container {
                max-width: 800px;
                width: 90%;
                background: rgba(30, 41, 59, 0.7);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                padding: 48px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            h1 { font-size: 2.5rem; margin-bottom: 0.5rem; color: var(--cyan); }
            p.subtitle { color: var(--text-dim); margin-bottom: 2rem; font-size: 1.1rem; }
            .section { margin-bottom: 32px; border-left: 2px solid var(--amber); padding-left: 20px; }
            .section h2 { font-size: 1.25rem; color: var(--amber); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; }
            code-block {
                display: block;
                background: #000;
                padding: 16px;
                border-radius: 12px;
                color: #10b981;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                margin-top: 8px;
                border: 1px solid rgba(16, 185, 129, 0.2);
            }
            .link-box {
                background: rgba(34, 211, 238, 0.1);
                border: 1px solid var(--cyan);
                padding: 16px;
                border-radius: 12px;
                margin-top: 16px;
                text-align: center;
            }
            a { color: var(--cyan); text-decoration: none; font-weight: 600; }
            a:hover { text-decoration: underline; }
            .badge {
                display: inline-block;
                padding: 4px 12px;
                background: var(--amber);
                color: #000;
                border-radius: 100px;
                font-size: 0.75rem;
                font-weight: 800;
                text-transform: uppercase;
                margin-bottom: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="badge">Internal Ops</div>
            <h1>Admin Setup Protocol</h1>
            <p class="subtitle">Secure instructions for initializing the KnowBot 3.0 Administrative Interface.</p>

            <div class="section">
                <h2>1. Access the Dashboard</h2>
                <div class="link-box">
                    <a href="https://knowbot30-production.up.railway.app/admin/login/?next=/admin/" target="_blank">
                        Open Admin Dashboard (Live)
                    </a>
                </div>
            </div>

            <div class="section">
                <h2>2. CLI Installation</h2>
                <p>Ensure you have the Railway Utility installed on your workstation:</p>
                <code-block>npm i -g @railway/cli</code-block>
            </div>

            <div class="section">
                <h2>3. Remote Terminal Access</h2>
                <p>Authenticating and establishing an SSH handshake with the production cluster:</p>
                <code-block>railway login</code-block>
                <code-block style="font-size: 0.75rem; margin-top: 10px;">railway ssh --project=af06bd05-337a-443c-af31-41ed631d5649 --environment=fd755d40-b6b2-4111-8061-9820e9e178ad --service=f281100c-b1b3-4a1e-9cbc-1b7fd46cdf5c</code-block>
            </div>

            <div class="section">
                <h2>4. Credential Creation</h2>
                <p>Once connected to the remote shell, initialize your superuser credentials:</p>
                <code-block>python manage.py createsuperuser</code-block>
            </div>

            <p style="text-align: center; color: var(--text-dim); font-size: 0.8rem; margin-top: 40px;">
                &copy; 2026 KnowBot Neural Systems • Environment: Production
            </p>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html_content)

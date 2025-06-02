import firebase_admin
from firebase_admin import credentials, firestore
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from google.cloud.firestore_v1.base_query import FieldFilter

# ---------- Configuration ----------
FIREBASE_CREDENTIALS_PATH = r"D:\Code\ProdDailyReport\Backend/prodadminapp-firebase-adminsdk-fbsvc-9a70300d08.json"  # Update path
ADMIN_EMAILS           = ["deepak@mimansaplay.com"]       # Where to send the status report
CC_EMAILS              = []                                   # Optional CC
SMTP_SERVER            = "smtp.gmail.com"
SMTP_PORT              = 587
SMTP_USERNAME          = "developer@mimansacare.com"        # Update
SMTP_PASSWORD          = "cnio mwan obyx lgah"          # Update

# Initialize Firebase
cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Compute today's date range
NOW = datetime.now()
start_of_day = datetime(NOW.year, NOW.month, NOW.day)
end_of_day   = start_of_day + timedelta(days=1)
today_str    = NOW.strftime("%d %B, %Y")


def send_email(to_emails, subject, message, cc_emails=None):
    """
    Send an email. Returns True on success, False on failure.
    """
    msg = MIMEMultipart()
    msg['From'] = SMTP_USERNAME
    msg['Subject'] = subject
    msg['To'] = ", ".join(to_emails) if isinstance(to_emails, list) else to_emails
    if cc_emails:
        msg['Cc'] = ", ".join(cc_emails) if isinstance(cc_emails, list) else cc_emails

    msg.attach(MIMEText(message, 'html'))
    recipients = to_emails + (cc_emails or [])

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(SMTP_USERNAME, recipients, msg.as_string())
        server.quit()
        print(f"{datetime.now()} Status email sent to {msg['To']}")
        return True
    except Exception as e:
        print(f"Failed to send status email. Error: {e}")
        return False


def fetch_email_statuses():
    """
    Fetch all email send status entries from Firestore for today.
    Returns a list of dicts with keys: childName, email, status, time.
    """
    col_ref = db.collection("emailSend")
    query = (
        col_ref
        .where(filter=FieldFilter("time", ">=", start_of_day))
        .where(filter=FieldFilter("time", "<",  end_of_day))
    )
    return [doc.to_dict() for doc in query.stream()]


def build_summary(status_entries):
    """
    Build an HTML summary of today's email send statuses.
    """
    total   = len(status_entries)
    sent    = sum(1 for e in status_entries if e.get('status') == 'sent')
    failed  = total - sent

    # Start HTML message
    html = f"<div style=\"font-family:Arial,sans-serif; color:#333;\">"
    html += f"<p>📅 <b>Date:</b> {today_str}</p>"
    html += f"<p>✉️ <b>Total Emails Processed:</b> {total}</p>"
    html += f"<p>✅ <b>Sent:</b> {sent}</p>"
    html += f"<p>❌ <b>Failed:</b> {failed}</p>"

    if failed > 0:
        html += "<hr><p><b>Failed details:</b></p><ul>"
        for entry in status_entries:
            if entry.get('status') != 'sent':
                child = entry.get('childName', 'Unknown')
                emails = ", ".join(entry.get('email', [])) if isinstance(entry.get('email'), list) else entry.get('email')
                time_str = entry.get('time').strftime("%H:%M:%S") if entry.get('time') else 'N/A'
                html += f"<li>{child} ({emails}) at {time_str}</li>"
        html += "</ul>"

    html += "<hr><p>Regards,<br/>Mimansa Kids Automated Report System</p></div>"
    return html, failed == 0


def main():
    statuses = fetch_email_statuses()

    if not statuses:
        print("No email send entries found for today.")
        # Optionally email that none were processed
        subject = f"Email Send Status — No Entries for {today_str}"
        body    = f"<p>No email send records were found for {today_str}.</p>"
        send_email(ADMIN_EMAILS, subject, body, cc_emails=CC_EMAILS)
        return

    summary_html, all_sent = build_summary(statuses)

    if all_sent:
        subject = f"📬 All Emails Sent Successfully — {today_str}"
    else:
        subject = f"⚠️ Email Send Failures Detected — {today_str}"

    send_email(ADMIN_EMAILS, subject, summary_html, cc_emails=CC_EMAILS)


if __name__ == "__main__":
    main()

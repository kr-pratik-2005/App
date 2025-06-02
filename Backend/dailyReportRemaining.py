import os
from datetime import datetime, date
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# --- Configuration ---
SERVICE_ACCOUNT_PATH = os.getenv(
    'GOOGLE_APPLICATION_CREDENTIALS',
    r''
)
ATTENDANCE_COLLECTION = 'attendance'
DAILY_REPORTS_COLLECTION = 'dailyReports'
EMAIL_LOG_COLLECTION = 'emailSend'

SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SMTP_USERNAME = 'developer@mimansacare.com'   # UPDATE
SMTP_PASSWORD = 'cnio mwan obyx lgah'         # UPDATE
CC_EMAILS = ['deepak@mimansaplay.com']

# Attendance timestamp format
MARKED_AT_FORMAT = '%m/%d/%Y, %I:%M %p'

# Recipient for unreported list
ADMIN_RECIPIENT = 'admin@mimansacare.com'    # UPDATE to your admin email

# --- Firebase initialization ---
if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)
db = firestore.client()


def send_email(
    to_emails,
    subject,
    message,
    smtp_server,
    smtp_port,
    smtp_username,
    smtp_password,
    cc_emails=None
):
    msg = MIMEMultipart()
    msg['From'] = smtp_username
    msg['Subject'] = subject

    # Build To header
    if isinstance(to_emails, list):
        msg['To'] = ', '.join(to_emails)
        recipients = to_emails[:]
    else:
        msg['To'] = to_emails
        recipients = [to_emails]

    # Build Cc header
    if cc_emails:
        msg['Cc'] = ', '.join(cc_emails)
        recipients += cc_emails

    msg.attach(MIMEText(message, 'html'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(smtp_username, recipients, msg.as_string())
        server.quit()
        print(f"{datetime.now()} Email sent to {msg['To']}"
              + (f" with CC to {msg.get('Cc')}" if cc_emails else ""))
        return True
    except Exception as e:
        print(f"Failed to send email. Error: {e}")
        return False


def fetch_attendance_today():
    today = date.today()
    attended = set()
    for doc in db.collection(ATTENDANCE_COLLECTION).stream():
        data = doc.to_dict() or {}
        for name, entry in data.get('attendance', {}).items():
            if entry.get('status') != 'present':
                continue
            marked_str = entry.get('markedAt')
            try:
                dt = datetime.strptime(marked_str, MARKED_AT_FORMAT)
            except Exception:
                continue
            if dt.date() == today:
                attended.add(name)
    return attended


def fetch_reported_kids_today():
    today = date.today()
    reported = set()
    for doc in db.collection(DAILY_REPORTS_COLLECTION).stream():
        data = doc.to_dict() or {}
        child = data.get('childName')
        date_field = data.get('date')
        report_date = None

        # Timestamp support
        if hasattr(date_field, 'date'):
            report_date = date_field.date()
        elif isinstance(date_field, str):
            try:
                part = date_field.split(' at ')[0]
                report_date = datetime.strptime(part, '%d %B %Y').date()
            except Exception:
                continue

        if report_date == today and child:
            reported.add(child)
    return reported


def main():
    attended = fetch_attendance_today()
    reported = fetch_reported_kids_today()
    # case-insensitive match against full names
    reported_norm = {r.lower() for r in reported}
    unreported = [name for name in attended if name.lower() not in reported_norm]

    if not unreported:
        print(datetime.now(), "All present students have submitted reports today.")
        return

    # Build HTML message for admins
    items = ''.join(f'<li>{n}</li>' for n in sorted(unreported))
    html = f"""
    <div>
      <p>The following students were marked present today ({date.today()}), but have <b>no daily report</b> submitted:</p>
      <ul>{items}</ul>
      <hr><p>Regards,<br/>Mimansa Kids Automated Report System</p></div>
    </div>
    """

    # Send to admin
    success = send_email(
        to_emails=ADMIN_RECIPIENT,
        subject=f"Unreported Attendance for {date.today()}",
        message=html,
        smtp_server=SMTP_SERVER,
        smtp_port=SMTP_PORT,
        smtp_username=SMTP_USERNAME,
        smtp_password=SMTP_PASSWORD,
        cc_emails=CC_EMAILS
    )

    # Log email send status
    db.collection(EMAIL_LOG_COLLECTION).add({
        'date': datetime.now(),
        'unreported': unreported,
        'emailSent': success
    })

if __name__ == '__main__':
    main()

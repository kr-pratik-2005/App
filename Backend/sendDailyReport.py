import firebase_admin
from firebase_admin import credentials, firestore
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from google.cloud.firestore_v1.base_query import FieldFilter

NOW = datetime.now()
today_str = NOW.strftime("%d %B, %Y")

# Initialize Firebase Admin SDK with your service account key.
cred = credentials.Certificate(
    r""
)
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
    """
    Send an email.
    Returns True on success, False on failure.
    """
    msg = MIMEMultipart()
    msg['From'] = smtp_username
    msg['Subject'] = subject

    # Build the To header & initial recipient list
    if isinstance(to_emails, list):
        msg['To'] = ", ".join(to_emails)
        recipients = to_emails.copy()
    else:
        msg['To'] = to_emails
        recipients = [to_emails]

    # Build the Cc header & append to recipients
    if cc_emails:
        if isinstance(cc_emails, list):
            msg['Cc'] = ", ".join(cc_emails)
            recipients += cc_emails
        else:
            msg['Cc'] = cc_emails
            recipients.append(cc_emails)

    msg.attach(MIMEText(message, 'html'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(smtp_username, recipients, msg.as_string())
        server.quit()
        print(f"{NOW} Email sent to {msg['To']}"
              + (f" with CC to {msg.get('Cc')}" if cc_emails else ""))
        return True
    except Exception as e:
        print(f"Failed to send email. Error: {e}")
        return False

def fetch_daily_reports():
    """
    Fetch all daily reports from Firestore for today.
    """
    now = datetime.now()
    start_of_day = datetime(now.year, now.month, now.day)
    end_of_day = start_of_day + timedelta(days=1)

    reports_ref = db.collection("dailyReports")
    query_ref = (
        reports_ref
        .where(filter=FieldFilter("date", ">=", start_of_day))
        .where(filter=FieldFilter("date", "<",  end_of_day))
    )

    return [doc.to_dict() for doc in query_ref.stream()]

def fetch_all_kids_info():
    """
    Fetch all kids info from the "kidsInfo" collection.
    Returns dict mapping kid name to their data.
    """
    kids_ref = db.collection("kidsInfo")
    kids_docs = kids_ref.stream()
    return {
        data.get("name"): data
        for doc in kids_docs
        if (data := doc.to_dict()).get("name")
    }

def summarize_report(report, kids_info):
    childName   = report.get("childName", "N/A")
    in_time     = report.get("inTime",     "N/A")
    out_time    = report.get("outTime",    "N/A")
    pooped      = report.get("poops",      "N/A")
    snackStatus = report.get("snack", "N/A").lower()
    foodStatus  = report.get("meal",       "N/A").lower()

    # Diaper vs Toilet
    no_diaper   = report.get("noDiaper", False)
    if no_diaper:
        diaper_emoji = "🚽"
        diaper_label = "Toilet visits (# times):"
        diaper_count = report.get("toiletVisits", "N/A")
    else:
        diaper_emoji = "🧷"
        diaper_label = "Diaper changes (# times):"
        diaper_count = report.get("diaperChanges", "N/A")

    # Feelings
    feelings = report.get("feelings", [])
    if isinstance(feelings, list) and feelings:
        feelings_str = ", ".join(feelings)
    else:
        feelings_str = "N/A"

    # Sleep Info (include only if slept)
    sleep_info = ""
    if not report.get("sleepNot", False):
        sleep_from = report.get("sleepFrom", "")
        sleep_to   = report.get("sleepTo",   "")
        if sleep_from and sleep_to:
            sleep_info = f"<li><b>Sleep:</b> Slept from {sleep_from} to {sleep_to}.</li>"

    # Notes and Themes
    teacher_note = report.get("notes", "").strip() or "No additional notes."
    themes = report.get("themeOfTheDay", [])
    if isinstance(themes, list):
        if not themes:
            theme_str = "No theme was covered today."
        elif len(themes) == 1:
            theme_str = f"The theme covered today was {themes[0]}."
        else:
            theme_str = f"The themes covered today were {', '.join(themes[:-1])}, and {themes[-1]}."
    else:
        theme_str = f"The theme covered today was {themes}."

    ouch_report = report.get("ouchReport", "").strip()
    common_note = report.get("commonParentsNote", "").strip()

    summary = f"""
    <div style="font-family: Arial, sans-serif; color: #333;">
        <p style="font-size: 16px;">
          Greetings from <b>Mimansa Kids,</b>
        </p>
        <p style="font-size: 15px;">
          Here's a summary of your child <b>{childName}</b>'s day at our Eden Garden center for <b>{today_str}</b>.
        </p>
        <table cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-size: 14px;">
            <tr><td>🕘</td><td><b>Came in at:</b> {in_time}</td></tr>
            <tr><td>🕔</td><td><b>Left at:</b> {out_time}</td></tr>
            <tr><td>{diaper_emoji}</td><td><b>{diaper_label}</b> {diaper_count}</td></tr>
            <tr><td>💩</td><td><b>Bowel movements (# times):</b> {pooped}</td></tr>
            <tr><td>😊</td><td><b>{childName} was feeling:</b> {feelings_str}</td></tr>
            <tr><td>🍪</td><td><b>Snack:</b> Ate {snackStatus} snack</td></tr>
            <tr><td>🍱</td><td><b>Meal:</b> Ate {foodStatus} meal</td></tr>
            {f"<tr><td>🛏️</td><td><b>Sleep:</b> Slept from {sleep_from} to {sleep_to}</td></tr>" if sleep_info else ""}
        </table>
        <br>
        <p style="font-size: 15px;"><b>Theme of the Day:</b> {theme_str}</p>
        <p style="font-size: 15px;"><b>Teacher's Note:</b> {teacher_note}</p>
    """

    if ouch_report:
        summary += f"""
        <p style="font-size: 15px;"><b>Ouch Report:</b> {ouch_report}</p>
        """

    if common_note:
        summary += f"""
        <p style="font-size: 15px;"><b>Note for Parents:</b> {common_note}</p>
        """

    summary += """
        <hr style="margin-top: 30px;">
        <p style="font-size: 14px;">Have a great day!</p>
        <p style="font-size: 14px;">With love,<br><b>Mimansa Kids Team</b></p>
        <img src="https://raw.githubusercontent.com/MimansaDeveloper/ProdAdminApp/main/Frontend/src/assets/Salutation.png"
             alt="Salutation" style="height:30px;margin-bottom:20px;">
    </div>
    """

    return summary

def main():
    # SMTP configuration
    smtp_server   = "smtp.gmail.com"
    smtp_port     = 587
    smtp_username = "developer@mimansacare.com"  # UPDATE
    smtp_password = "cnio mwan obyx lgah"        # UPDATE

    reports   = fetch_daily_reports()
    kids_info = fetch_all_kids_info()

    if not reports:
        print("No daily reports found for today.")
        return

    for report in reports:
        # Gather both parent emails
        to_emails = []
        if report.get("email"):
            to_emails.append(report["email"])
        if report.get("email2"):
            to_emails.append(report["email2"])

        if not to_emails:
            print("No parent email found for report:", report)
            continue

        subject = f"Daily Report for {report.get('childName','Your Child')} — {today_str}"
        body    = summarize_report(report, kids_info)

        # Send and capture status
        success = send_email(
            to_emails,
            subject,
            body,
            smtp_server,
            smtp_port,
            smtp_username,
            smtp_password,
            cc_emails=["deepak@mimansaplay.com"]
        )

        # Record in Firestore
        db.collection("emailSend").add({
            "childName": report.get("childName"),
            "email":     to_emails,
            "status":    "sent"   if success else "failed",
            "time":      datetime.now()
        })

if __name__ == "__main__":
    main()

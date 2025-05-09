# app/utils/mail.py
import smtplib
from email.message import EmailMessage

def send_email(to, subject, body):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = 'damariskerry@gmail.com'
    msg['To'] = to
    msg.set_content(body)

    # Example with Gmail SMTP (you must allow "less secure apps" or use app password)
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login('your_email@gmail.com', 'your_password')
        smtp.send_message(msg)

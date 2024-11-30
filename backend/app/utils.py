import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import mailersend
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Function to hash password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# Function to verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# OTP generation function
def generate_otp() -> str:
    otp = random.randint(100000, 999999)  # Generate a 6-digit OTP
    return str(otp)

# Function to send email with OTP
def send_otp_email(to_email: str, otp: str):
    from_email = os.getenv('FROM_EMAIL')  # Replace with your email
    from_password = os.getenv('FROM_PASSWORD')  # Replace with your email password
    smtp_server = os.getenv('SMTP_SERVER')  # Use the SMTP server for your email provider
    smtp_port = os.getenv('SMTP_PORT')  # SMTP port for sending email (typically 587 for TLS)

    # Compose the email
    subject = "Your OTP Code"
    body = f"Your OTP code is: {otp}"

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    try:
        # Establish the connection to the SMTP server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Secure the connection
        server.login(from_email, from_password)
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()  # Close the connection to the server
        print(f"OTP sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        raise Exception("Email sending failed")
    
    
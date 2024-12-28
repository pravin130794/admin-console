import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import HTTPException
import jwt
import pytz
from datetime import datetime, timedelta, timezone
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import os

load_dotenv()

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY","d4DkB7t1sI7AkLp1T8RfbD8yJ9LMT5v5DBNx0wF5WKM=")
# Load secret key and configurations from environment
SECRET_KEY = os.getenv("JWT_SECRET_KEY","20da24faf6b542d34131de1a27fc72806df274dfec9ae87ea70502274fb203c1")
ALGORITHM = os.getenv("JWT_ALGORITHM","HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("JWT_EXPIRATION_MINUTES","60")
fernet = Fernet(ENCRYPTION_KEY.encode())

def encrypt_password(password: str) -> str:
    """Encrypts the password."""
    return fernet.encrypt(password.encode()).decode()

def decrypt_password(encrypted_password: str) -> str:
    """Decrypts the password."""
    return fernet.decrypt(encrypted_password.encode()).decode()

# OTP generation function
def generate_otp() -> str:
    otp = random.randint(100000, 999999)  # Generate a 6-digit OTP
    return str(otp)

# Function to send email with OTP
async def send_otp_email(to_email: str, otp: str):
    from_email = os.getenv('FROM_EMAIL',"anku130794@gmail.com")  # Replace with your email
    from_password = os.getenv('FROM_PASSWORD',"xhlexropodjtdwbf")  # Replace with your email password
    smtp_server = os.getenv('SMTP_SERVER',"smtp.gmail.com")  # Use the SMTP server for your email provider
    smtp_port = os.getenv('SMTP_PORT',587)  # SMTP port for sending email (typically 587 for TLS)

    # Compose the email
    subject = "Your OTP Code"
    body = f"Your OTP code is: {otp} expire in : 5 minutes"

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
    
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    # expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_access_token(token: str) -> dict:
    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token error.")
    
def verify_password(plain_password: str, encrypted_password: str) -> bool:
    """
    Verifies if the plain password matches the encrypted password.
    :param plain_password: The password provided by the user during login.
    :param encrypted_password: The encrypted password stored in the database.
    :return: True if the passwords match, False otherwise.
    """
    try:
        decrypted_password = decrypt_password(encrypted_password)
        return decrypted_password == plain_password
    except Exception as e:
        # Handle decryption errors (e.g., tampered data)
        print(f"Error verifying password: {e}")
        return False
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://root_user:root_password@localhost:27017/?authSource=admin"
    MONGO_DB_NAME: str = "mydb"

settings = Settings()

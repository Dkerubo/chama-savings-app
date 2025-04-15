import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///chama.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",  # nếu em có mật khẩu thì điền ở đây
        database="thansohoc_db"
    )
    return connection

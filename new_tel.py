import sqlite3

def update_telegram_link(region_name, telegram_link):
    db_file = "surfcommunity.db"
    with sqlite3.connect(db_file) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE regions SET `telegram-link` = ? WHERE name = ?",
            (telegram_link, region_name)
        )
        if cursor.rowcount == 0:
            print(f"No region found with name: {region_name}")
        else:
            print(f"Updated region '{region_name}' with Telegram link.")

# Example usage
update_telegram_link("Monmouth County", "https://t.me/+LgE7xBs90RpkZDRh")

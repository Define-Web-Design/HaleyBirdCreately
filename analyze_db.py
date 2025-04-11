#!/usr/bin/env python3
"""
Database Analysis Script for Creately

This script connects to the PostgreSQL database and provides information about the
database structure, including tables, columns, and relationships.
"""

import os
import sys
import psycopg2
from psycopg2 import sql
from datetime import datetime

def get_connection():
    """Connect to the PostgreSQL database using environment variables."""
    try:
        conn = psycopg2.connect(os.environ.get("DATABASE_URL"))
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None

def get_tables(conn):
    """Get a list of all tables in the database."""
    tables = []
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            tables = [row[0] for row in cur.fetchall()]
    except Exception as e:
        print(f"Error getting tables: {e}")
    return tables

def get_table_columns(conn, table_name):
    """Get column information for a specific table."""
    columns = []
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = %s
                ORDER BY ordinal_position;
            """, (table_name,))
            columns = cur.fetchall()
    except Exception as e:
        print(f"Error getting columns for table {table_name}: {e}")
    return columns

def get_primary_keys(conn, table_name):
    """Get primary key columns for a specific table."""
    primary_keys = []
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                WHERE tc.constraint_type = 'PRIMARY KEY'
                    AND tc.table_schema = 'public'
                    AND tc.table_name = %s
                ORDER BY kcu.ordinal_position;
            """, (table_name,))
            primary_keys = [row[0] for row in cur.fetchall()]
    except Exception as e:
        print(f"Error getting primary keys for table {table_name}: {e}")
    return primary_keys

def get_foreign_keys(conn, table_name):
    """Get foreign key relationships for a specific table."""
    foreign_keys = []
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_schema = 'public'
                    AND tc.table_name = %s;
            """, (table_name,))
            foreign_keys = cur.fetchall()
    except Exception as e:
        print(f"Error getting foreign keys for table {table_name}: {e}")
    return foreign_keys

def analyze_database():
    """Main function to analyze the database structure."""
    conn = get_connection()
    if not conn:
        return

    try:
        print("\n========== DATABASE ANALYSIS ==========")
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=======================================\n")

        tables = get_tables(conn)
        if not tables:
            print("No tables found in the database.")
            return

        print(f"Found {len(tables)} tables in the database:")
        for i, table in enumerate(tables, 1):
            print(f"{i}. {table}")

        print("\n--- DETAILED TABLE INFORMATION ---\n")
        for table in tables:
            print(f"Table: {table}")
            
            # Get primary keys
            pk_columns = get_primary_keys(conn, table)
            if pk_columns:
                print("  Primary Key(s):", ", ".join(pk_columns))
            else:
                print("  Primary Key(s): None")
            
            # Get columns
            columns = get_table_columns(conn, table)
            print("  Columns:")
            for col_name, data_type, is_nullable in columns:
                nullable = "NULL" if is_nullable == "YES" else "NOT NULL"
                pk_indicator = " (PK)" if col_name in pk_columns else ""
                print(f"    - {col_name}: {data_type} {nullable}{pk_indicator}")
            
            # Get foreign keys
            fk_relations = get_foreign_keys(conn, table)
            if fk_relations:
                print("  Foreign Keys:")
                for col_name, ref_table, ref_col in fk_relations:
                    print(f"    - {col_name} -> {ref_table}({ref_col})")
            
            print()  # Empty line between tables

    except Exception as e:
        print(f"Error analyzing database: {e}")
    finally:
        conn.close()

def main():
    """Entry point of the script."""
    print("Creately Database Analysis Tool")
    print("===============================")
    
    if not os.environ.get("DATABASE_URL"):
        print("Error: DATABASE_URL environment variable not found.")
        print("Make sure the PostgreSQL database is properly configured.")
        return 1
    
    analyze_database()
    return 0

if __name__ == "__main__":
    sys.exit(main())
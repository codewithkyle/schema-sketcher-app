export const MYSQL_TYPES = [
  // Numeric Types
  "TINYINT",
  "SMALLINT",
  "MEDIUMINT",
  "INT",
  "INTEGER",
  "BIGINT",
  "FLOAT",
  "DOUBLE",
  "DOUBLE PRECISION",
  "REAL",
  "DECIMAL",
  "NUMERIC",
  "BIT",
  "BOOL",
  "BOOLEAN",

  // Date and Time Types
  "DATE",
  "DATETIME",
  "TIMESTAMP",
  "TIME",
  "YEAR",

  // String / Character / Binary Types
  "CHAR",
  "VARCHAR",
  "BINARY",
  "VARBINARY",
  "TINYBLOB",
  "BLOB",
  "MEDIUMBLOB",
  "LONGBLOB",
  "TINYTEXT",
  "TEXT",
  "MEDIUMTEXT",
  "LONGTEXT",
  "ENUM",
  "SET",

  // Spatial Types
  "GEOMETRY",
  "POINT",
  "LINESTRING",
  "POLYGON",
  "MULTIPOINT",
  "MULTILINESTRING",
  "MULTIPOLYGON",
  "GEOMETRYCOLLECTION",

  // JSON Type
  "JSON",

  // Vector / AI-embedding Types
  "VECTOR"
];

export const POSTGRES_TYPES = [
  // Numeric Types
  "SMALLINT",
  "INTEGER",
  "BIGINT",
  "DECIMAL",
  "NUMERIC",
  "REAL",
  "DOUBLE PRECISION",
  "SERIAL",
  "BIGSERIAL",
  "SMALLSERIAL",

  // Monetary Types
  "MONEY",

  // Character Types
  "CHAR",
  "VARCHAR",
  "TEXT",

  // Binary Types
  "BYTEA",

  // Date/Time Types
  "DATE",
  "TIME",
  "TIMETZ",
  "TIMESTAMP",
  "TIMESTAMPTZ",
  "INTERVAL",

  // Boolean Type
  "BOOLEAN",

  // Enumerated Type
  "ENUM",

  // Geometric Types
  "POINT",
  "LINE",
  "LSEG",
  "BOX",
  "PATH",
  "POLYGON",
  "CIRCLE",

  // Network Address Types
  "CIDR",
  "INET",
  "MACADDR",
  "MACADDR8",

  // Bit String Types
  "BIT",
  "VARBIT",

  // Text Search Types
  "TSVECTOR",
  "TSQUERY",

  // UUID Type
  "UUID",

  // XML Type
  "XML",

  // JSON Types
  "JSON",
  "JSONB",

  // Range Types
  "INT4RANGE",
  "INT8RANGE",
  "NUMRANGE",
  "TSRANGE",
  "TSTZRANGE",
  "DATERANGE"
];

export const SQLITE_TYPES = [
  // Storage classes / affinities
  "INTEGER",
  "REAL",
  "NUMERIC",
  "TEXT",
  "BLOB",
  "NULL",

  // Common declared types
  "INT",
  "SMALLINT",
  "TINYINT",
  "MEDIUMINT",
  "BIGINT",
  "UNSIGNED BIG INT",
  "INT2",
  "INT8",
  "DOUBLE",
  "DOUBLE PRECISION",
  "FLOAT",
  "DECIMAL",
  "BOOLEAN",
  "DATE",
  "DATETIME",
  "CHARACTER",
  "VARCHAR",
  "VARYING CHARACTER",
  "NCHAR",
  "NVARCHAR",
  "CLOB"
];

export const SQL_SERVER_TYPES = [
  // Numeric Types
  "BIT",
  "TINYINT",
  "SMALLINT",
  "INT",
  "BIGINT",
  "DECIMAL",
  "NUMERIC",
  "SMALLMONEY",
  "MONEY",
  "FLOAT",
  "REAL",

  // Date and Time Types
  "DATE",
  "TIME",
  "DATETIME",
  "SMALLDATETIME",
  "DATETIME2",
  "DATETIMEOFFSET",

  // Character String Types
  "CHAR",
  "VARCHAR",
  "VARCHAR(MAX)",// large-variant
  "TEXT",// deprecated

  // Unicode Character String Types
  "NCHAR",
  "NVARCHAR",
  "NVARCHAR(MAX)",// large‐variant
  "NTEXT",// deprecated

  // Binary String Types
  "BINARY",
  "VARBINARY",
  "VARBINARY(MAX)",// large‐variant
  "IMAGE",// deprecated

  // Other Data Types
  "CURSOR",
  "TABLE",
  "UNIQUEIDENTIFIER",
  "XML",
  "SQL_VARIANT",
  "ROWVERSION",
  "HIERARCHYID",
  "VECTOR",

  // Spatial Data Types
  "GEOGRAPHY",
  "GEOMETRY",

  // JSON Type
  "JSON",

  // Timestamp alias / legacy
  "TIMESTAMP"
];

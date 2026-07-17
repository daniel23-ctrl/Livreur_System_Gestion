# Commande pour lancer la migration

alembic revision --autogenerate -m "creation des tables"

# Commande pour crééer les tables dans neon

alembic upgrade head

La différence entre les deux commandes

alembic revision --autogenerate -m "creation des tables"
_Génère un fichier de migration Python dans alembic/versions/_
_C'est comme écrire la recette de ce qu'il faut faire_
_Elle ne touche pas encore la base de données_
alembic upgrade head

_Exécute le fichier de migration généré_
_C'est comme cuisiner la recette_
_Elle crée réellement les tables dans PostgreSQL/Neon_

# Pour que cela soit local

_Il va falloir modifier la sequence de code dans env.py de alembic_ :
config.set_main_option(
"sqlalchemy.url",
settings.DATABASE_URL.replace("+asyncpg", "+psycopg2")
)

_En_ :
config.set_main_option(
"sqlalchemy.url",
settings.DATABASE_URL.replace("+asyncpg", "")
)

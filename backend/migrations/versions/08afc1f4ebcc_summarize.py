"""summarize

Revision ID: 08afc1f4ebcc
Revises: c4b843d1ef4c
Create Date: 2023-11-25 14:41:14.451331

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '08afc1f4ebcc'
down_revision = 'c4b843d1ef4c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('pdf_summary',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('summary_text', sa.Text(), nullable=True),
    sa.Column('pdf_text_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['pdf_text_id'], ['pdf_text.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('pdf_summary')
    # ### end Alembic commands ###

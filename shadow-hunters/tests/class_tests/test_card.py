import pytest

import constants as C
from card import Card

# test_card.py
# Tests for the Card object


def test_fields():

    # test initialization
    c = Card(
        title="card_title",
        desc="card_desc",
        color=C.CardType.White,
        holder=None,
        is_equip=False,
        use=lambda: 5,
    )

    # test fields
    assert c.title == "card_title"
    assert c.desc == "card_desc"
    assert c.color == C.CardType.White
    assert c.holder is None
    assert not c.is_equipment
    assert c.use() == 5

    # test dump
    dump = c.dump()
    assert dump['title'] == "card_title"
    assert dump['desc'] == "card_desc"

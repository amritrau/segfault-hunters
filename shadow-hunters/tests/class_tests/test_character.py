import pytest

from character import Character
import constants as C

# test_character.py
# Tests for the Character object


def test_fields():

    # test initialization
    c = Character(
        name="char_name",
        alleg=C.Alleg.Neutral,
        max_damage=10,
        win_cond=lambda: 5,
        win_cond_desc="win_desc",
        special=lambda: 5,
        special_desc="special_desc",
        resource_id="r_id"
    )

    # test fields
    assert c.name == "char_name"
    assert c.alleg == C.Alleg.Neutral
    assert c.max_damage == 10
    assert c.win_cond() == 5
    assert c.win_cond_desc == "win_desc"
    assert c.special() == 5
    assert c.special_desc == "special_desc"
    assert c.resource_id == "r_id"

    # test dump
    dump = c.dump()
    assert dump['name'] == "char_name"
    assert dump['alleg'] == "Neutral"
    assert dump['max_damage'] == 10
    assert dump['win_cond_desc'] == "win_desc"
    assert dump['resource_id'] == "r_id"

import pytest
import random

import game_context
import player
import cli
from tests import helpers

# test_area_actions.py
# Tests the possible actions at each area

def test_underworld_gate():
    player_names = ['Amrit', 'Max', 'Gia', 'Joanna', 'Vishal']
    players = [player.Player(user_id, socket_id='unused') for user_id in player_names]
    ef = cli.ElementFactory()
    gc = game_context.GameContext(
        players = players,
        characters = ef.CHARACTERS,
        black_cards = ef.BLACK_DECK,
        white_cards = ef.WHITE_DECK,
        green_cards = ef.GREEN_DECK,
        areas = ef.AREAS,
        tell_h = lambda x: 0,
        direct_h = lambda x, sid: 0,
        ask_h = lambda x, y, z: { 'value': random.choice(y['options']) },
        update_h = lambda x, y: 0
    )
    assert 1
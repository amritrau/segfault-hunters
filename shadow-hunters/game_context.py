from die import Die
from zone import Zone

from utils import make_hash_sha256
import constants as C
import random
import copy

# game_context.py
# Implements a GameContext.


class GameContext:
    def __init__(self, players, characters, black_cards, white_cards,
                 hermit_cards, areas, ask_h, tell_h, show_h, update_h,
                 modifiers=dict()):

        # Instantiate gameplay objects
        self.players = players
        self.turn_order = copy.copy(players)
        self.round_count = 0

        # Assign "local delexicalizations" for each player.
        # Reason: This allows a game-playing agent to parse data dumps about
        # its opponents regardless of what their particular screen names are.
        #
        # Implementation: Each player has `delexicalizations`, which is a
        # dictionary that maps user_id => delexicalization. Player p's
        # delexicalization dictionary follows the turn order starting with p,
        # so that p.delexicalizations[p.user_id] = 0. The player whose turn is
        # next, q, is delexicalized from p's view as 1:
        #  > p.delexicalizations[q.user_id] = 1
        # ... and so on.
        for p in self.players:
            n = self.turn_order.index(p) - 1
            d = self.turn_order[-n:] + self.turn_order[:-n]
            inv = dict(enumerate(d)).items()
            p.delexicalizations = {v.user_id: k for k, v in inv}

        # Instantiate characters
        self.characters = characters
        if len(self.players) <= 6:
            self.characters = [
                ch for ch in self.characters if ch.resource_id != "bob2"]
        else:
            self.characters = [
                ch for ch in self.characters if ch.resource_id != "bob1"]
        self.characters.sort(key=lambda x: -x.max_damage)

        # Instantiate cards
        self.black_cards = black_cards
        self.white_cards = white_cards
        self.hermit_cards = hermit_cards

        # Instantiate status
        self.game_over = False

        # Instantiate message handlers
        self.ask_h = ask_h
        self.tell_h = tell_h
        self.show_h = show_h
        self.update_h = update_h

        # Instantiate answer bin
        self.answer_bin = {
            'answered': False,
            'sid': '',
            'data': {}
        }

        # Assign modifiers
        self.modifiers = modifiers

        # Instantiate dice
        self.die4 = Die(4)
        self.die6 = Die(6)

        # Randomly shuffle areas across zones
        random.shuffle(areas)
        self.zones = [Zone([areas.pop(), areas.pop()]) for _ in range(3)]
        for z in self.zones:
            for a in z.areas:
                a.zone = z

        # Figure out how many of each allegiance there has to be
        counts_dict = {
            4: {C.Alleg.Hunter: 2, C.Alleg.Neutral: 0, C.Alleg.Shadow: 2},
            5: {C.Alleg.Hunter: 2, C.Alleg.Neutral: 1, C.Alleg.Shadow: 2},
            6: {C.Alleg.Hunter: 2, C.Alleg.Neutral: 2, C.Alleg.Shadow: 2},
            7: {C.Alleg.Hunter: 2, C.Alleg.Neutral: 3, C.Alleg.Shadow: 2},
            8: {C.Alleg.Hunter: 3, C.Alleg.Neutral: 2, C.Alleg.Shadow: 3},
        }

        # Randomly assign characters and point game context
        character_q = copy.deepcopy(self.characters)
        random.shuffle(character_q)
        queue = []
        while character_q:
            ch = character_q.pop()
            already_in = len([c for c in queue if c.alleg == ch.alleg])
            if (already_in < counts_dict[len(self.players)][ch.alleg]):
                queue.append(ch)

        assert(len(queue) == len(self.players))

        for player in self.players:
            player.setCharacter(queue.pop())
            player.gc = self

    def getLivePlayers(self, filter_fn=(lambda x: True)):
        live = [p for p in self.players if p.state != C.PlayerState.Dead]
        return list(filter(filter_fn, live))

    def getDeadPlayers(self, filter_fn=(lambda x: True)):
        dead = [p for p in self.players if p.state == C.PlayerState.Dead]
        return list(filter(filter_fn, dead))

    def getPlayersAt(self, location_name):
        live = self.getLivePlayers()
        live_loc = [p for p in live if p.location]
        return [p for p in live_loc if p.location.name == location_name]

    def getAreas(self):
        areas = []
        for z in self.zones:
            for a in z.areas:
                areas.append(a.name)

        return areas

    def getAreaFromRoll(self, roll_result):
        destination_Area = None
        for z in self.zones:
            for a in z.areas:
                if roll_result in a.domain:
                    destination_Area = a

        return destination_Area

    def _checkWinConditions(self):
        return [p for p in self.players if p.character.win_cond(self, p)]

    def checkWinConditions(self, tell=True):
        winners = self._checkWinConditions()
        if len(winners):
            self.game_over = True
            winners = self._checkWinConditions()  # Hack to collect Allie
            if tell:
                display_data = {'type': 'win', 'winners': [
                    p.dump() for p in winners]}
                self.show_h(display_data)
                for w in winners:
                    self.tell_h("{} ({}: {}) won! {}", [
                        w.user_id,
                        w.character.alleg.name,
                        w.character.name,
                        w.character.win_cond_desc
                    ])
            return winners

    def play(self, debug=False):
        game_hash = ""
        turn = random.randint(0, len(self.turn_order) - 1)

        # TODO(analytics) Game started with `len(self.players)`` players
        while True:
            # Hash each successive game state
            # (effectively Reduce(states, lambda a, b: hash(a + b)))
            if debug:
                hashed_game_state = make_hash_sha256(self.dump())
                game_hash = make_hash_sha256(game_hash + hashed_game_state)

            current_player = self.turn_order[turn]
            if current_player.state != C.PlayerState.Dead:
                current_player.takeTurn()
            winners = self.checkWinConditions()
            if winners:
                break
            turn += 1
            if turn >= len(self.turn_order):
                turn = 0
                self.round_count += 1
                self.turn_order = list(self.players)

        # TODO(analytics) Game ended with winners `winners` after
        # `self.round_count` turns

        if debug:
            return game_hash

    def dump(self):
        # Note that public_players and private_state are no longer keyed by
        # socket_ids
        public_zones = [z.dump() for z in self.zones]
        private_players = [p.dump() for p in self.players]
        public_players = copy.deepcopy(private_players)

        # Hide character information if player hasn't revealed themselves
        for p in public_players:
            if p['state'] == 2:
                p['character'] = {}

        # Collect the public states
        public_state = {
            'zones': public_zones,
            'players': public_players,
            'characters': [c.dump() for c in self.characters]
        }
        private_state = private_players

        return public_state, private_state

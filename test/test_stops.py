from pyethereum import tester

class TestStops(object):

    CONTRACT = """
def shared():
    REEL_COUNT = 3
    REEL_POSITIONS = 32

def get_stops(rnd):
    stops = array(REEL_COUNT)
    i = 0
    while i < REEL_COUNT:
        stops[i] = rnd % REEL_POSITIONS
        rnd = rnd / REEL_POSITIONS
        i += 1
    return(stops, REEL_COUNT)

def pass(rnd):
    return(self.get_stops(rnd, outsz=REEL_COUNT), REEL_COUNT)
"""

    def setup_class(cls):
        cls.s = tester.state()
        cls.c = cls.s.contract(cls.CONTRACT)
        cls.snapshot = cls.s.snapshot()

    def setup_method(self, method):
        self.s.revert(self.snapshot)

    def _get_stops(self, rnd):
        return self.s.send(tester.k0, self.c, 0, funid=0, abi=[rnd])

    def _pass(self, rnd):
        return self.s.send(tester.k0, self.c, 0, funid=1, abi=[rnd])

    def test_get_stops(self):
        assert self._get_stops(23888) == [16, 10, 23]
        assert self._get_stops(1606) == [6, 18, 1]
        assert self._get_stops(30464) == [0, 24, 29]

    def test_pass(self):
        assert self._pass(23888) == [16, 10, 23]
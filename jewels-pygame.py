RED = 'S'
ORANGE = 'T'
YELLOW = 'V'
GREEN = 'W'
BLUE = 'X'
INDIGO = 'Y'
VIOLET = 'Z'

class GameOverError(Exception):
    '''Raised if the game ends.'''
    pass

class EarlyEnd(Exception):
    '''Raised if the user ends the game early.'''
    pass

class Game:
    def __init__(self):
        self._rows = 13
        self._cols = 6
        self._game: list[list[str]] = [[None]*self._rows for col in range(self._cols)]

    def list(self) -> list[list[str]]:
        'Returns a copy of the game.'
        copy: list[list[str]] = []
        for column in self._game:
            copy.append(column[:])
        return copy

    def drop_all_jewels(self):
        'Drops all jewels in the column to the lowest available position.'
        for col in range(len(self._game)):
            self._game[col] = self._shift_list(self._game[col])

    def remove_matches(self) -> None:
        'Removes all matching jewels from the game.'
        for col in range(0, self._cols):
            for row in range(0, self._rows):
                if self._game[col][row] != None:
                    if self._game[col][row].startswith('*'):
                        self._game[col][row] = None

    def check_matches(self) -> None:
        'Looks through entire game for any matching jewels.'
        match_board: list[list[str]] = []
        for column in self._game:
            match_board.append(column[:])

        for col in range(0, self._cols):
            for row in range(0, self._rows):
                if self._game[col][row] != None:
                    if col < self._cols-2:
                        match_board = self._check_horizontal(match_board, row, col)
                        if row < self._rows-2:
                            match_board = self._check_diagonal_down(match_board, row, col)
                    if row < self._rows-2:
                        match_board = self._check_vertical(match_board, row, col)
                    if (col < self._cols-2) and (row >= 2):
                        match_board = self._check_diagonal_up(match_board, row, col)
        
        self._game = match_board

    def has_matches(self) -> bool:
        'Returns true if the game has matches and false if not.'
        for col in self._game:
            for space in col:
                if space != None:
                    if space.startswith('*'):
                        return True
        return False

    def update_game(self, fallers) -> None:
        'Combines fallers and game lists, adding the faller to the game.'
        for col in range(len(fallers)):
            for row in range(len(fallers[0])):
                if fallers[col][row] != None:
                    self._game[col][row] = fallers[col][row]

    def full(self) -> bool:
        'Checks if the game board is already filled.'
        for col in self._game:
            if col[0] == None:
                return False
        
        return True     

    def _check_vertical(self, match_board, object_row: int, object_col: int):
        'Checks for 3 or more consecutive matching jewels in a vertical line.'
        matches: list[int] = []
        match: str = self._game[object_col][object_row]
        for row in range(object_row, self._rows):
            if self._game[object_col][row] == match:
                matches.append(row)
            else:
                break

        if len(matches) >= 3:
            for row in matches:
                match_board[object_col][row] = f'*{self._game[object_col][row]}*'

        return match_board

    def _check_horizontal(self, match_board, object_row: int, object_col: int):
        'Checks for 3 or more consecutive matching jewels in a horizontal line.'
        matches: list[int] = []
        match: str = self._game[object_col][object_row]
        for col in range(object_col, self._cols):
            if self._game[col][object_row] == match:
                matches.append(col)
            else:
                break

        if len(matches) >= 3:
            for col in matches:
                match_board[col][object_row] = f'*{self._game[col][object_row]}*'
                
        return match_board

    def _check_diagonal_down(self, match_board, object_row: int, object_col: int):
        'Checks for 3 or more consecutive matching jewels in a downwards diagonal line.'
        matches: list[tuple[int]] = []
        match: str = self._game[object_col][object_row]

        limit: int
        if (self._cols-object_col) < (self._rows-object_row):
            limit = self._cols-object_col
        else:
            limit = self._rows-object_row

        for num in range(0, limit):
            if self._game[object_col + num][object_row + num] == match:
                matches.append((object_col + num, object_row + num))
            else:
                break

        if len(matches) >= 3:
            for pair in matches:
                match_board[pair[0]][pair[1]] = f'*{self._game[pair[0]][pair[1]]}*'
                
        return match_board
    
    def _check_diagonal_up(self, match_board, object_row: int, object_col: int):
        'Checks for 3 or more consecutive matching jewels in an upwards diagonal line.'
        matches: list[tuple[int]] = []
        match: str = self._game[object_col][object_row]

        limit: int
        if (self._cols - object_col) < object_row+1:
            limit = self._cols - object_col
        else:
            limit = object_row+1

        for num in range(0, limit):
            if self._game[object_col + num][object_row - num] == match:
                matches.append((object_col + num, object_row - num))
            else:
                break

        if len(matches) >= 3:
            for pair in matches:
                match_board[pair[0]][pair[1]] = f'*{self._game[pair[0]][pair[1]]}*'
                
        return match_board

    def _shift_list(self, col):
        '''Moves all objects that are not None to the end of the list,
        while maintaining the order.'''
        shifted_list: list[str] = []
        for item in col:
            if item == None:
                shifted_list.insert(0, None)
            else:
                shifted_list.append(item)

        return shifted_list
    

class Faller:
    def __init__(self, game: Game, column: int, x: str, y: str, z: str):
        self._rows = 13
        self._cols = 6
        self._fallers: list[list[str]] = [[None]*self._rows for col in range(self._cols)]
        self._game = game
        self._column = column
        self._x = x
        self._y = y
        self._z = z

    def drop_faller(self):
        '''Drops the faller one space in the game accordingly.
        Changes between [X], |X|, and X as necessary.'''
        empty_row: int = self._find_empty()
        if self._x != None:
            if self.can_drop():
                if not self._z_in_faller():
                    #if the faller is not completely in
                    self._fallers[self._column][empty_row] = f'[{self._x}]'
                    if empty_row >= 1:
                        self._fallers[self._column][empty_row-1] = f'[{self._y}]'
                    if empty_row >= 2:
                        self._fallers[self._column][empty_row-2] = f'[{self._z}]'

                    if not self.can_drop():
                        self._change_to_dropped()
                else:
                    #if the faller is completely in
                    if empty_row < self._rows-1:
                        if self._game.list()[self._column][empty_row] == None:
                            self._drop()
                    elif empty_row+1 == self._rows:
                        self._drop()
                    
                    if not self.can_drop():
                        #if the faller has dropped onto a jewel
                        #[X] -> |X|
                        self._change_to_dropped()
            else:
                if self._z_in_faller():
                    #if the faller can't drop but has landed
                    #|X| -> X
                    self.land_faller()
                    self._game.update_game(self._fallers)
                    self._game.check_matches()
                    self.empty_board()
                    self._x = None
                    self._y = None
                    self._z = None
                else:
                    #if the faller can't drop but is not fully in
                    raise GameOverError

    def list(self) -> list[list[str]]:
        'Returns a copy of the fallers list.'
        copy: list[list[str]] = []
        for column in self._fallers:
            copy.append(column[:])
        return copy

    def land_faller(self) -> None:
        'Changes all jewels in the faller from |X| to X.'
        for col in range(len(self._fallers)):
            for row in range(len(self._fallers[0])):
                if self._fallers[col][row] == f'|{self._x}|':
                    self._fallers[col][row] = self._x
                if self._fallers[col][row] == f'|{self._y}|':
                    self._fallers[col][row] = self._y
                if self._fallers[col][row] == f'|{self._z}|':
                    self._fallers[col][row] = self._z

    def rotate(self) -> None:
        '''Rotates the jewels in the faller, moving the bottom one to the top
        and shifting the rest down one space.'''
        for row in range(len(self._fallers[self._column])):
            space = self._fallers[self._column][row]
            if space == f'[{self._x}]':
                self._fallers[self._column][row] = f'[{self._y}]'
            if space == f'[{self._y}]':
                self._fallers[self._column][row] = f'[{self._z}]'
            if space == f'[{self._z}]':
                self._fallers[self._column][row] = f'[{self._x}]'

            if space == f'|{self._x}|':
                self._fallers[self._column][row] = f'|{self._y}|'
            if space == f'|{self._y}|':
                self._fallers[self._column][row] = f'|{self._z}|'
            if space == f'|{self._z}|':
                self._fallers[self._column][row] = f'|{self._x}|'

        temp_z: str = self._z
        self._z = self._x
        self._x = self._y
        self._y = temp_z

    def move_right(self) -> None:
        '''If possible, moves the faller to the right.
        Changes the faller from [X] to |X| and vice versa as necessary.'''
        can_move: bool = True
        if self._x != None:
            if self._column+1 < len(self._fallers):
                for row in range(len(self._fallers[0])):
                    if (self._fallers[self._column][row] != None) and (self._game.list()[self._column+1][row] != None):
                        can_move = False
            else:
                can_move = False

            if can_move:
                for row in range(len(self._fallers[0])):
                    self._fallers[self._column + 1][row] = self._fallers[self._column][row]
                    self._fallers[self._column][row] = None
                self._column += 1

                if self.can_drop():
                    self.change_back()
                else:
                    self._change_to_dropped()

    def move_left(self) -> None:
        '''If possible, moves the faller to the left.
        Changes the faller from [X] to |X| and vice versa as necessary.'''
        can_move: bool = True
        if self._x != None:
            if self._column > 0:
                for row in range(len(self._fallers[0])):
                    if (self._fallers[self._column][row] != None) and (self._game.list()[self._column-1][row] != None):
                        can_move = False
            else:
                can_move = False

            if can_move:
                for row in range(len(self._fallers[0])):
                    self._fallers[self._column - 1][row] = self._fallers[self._column][row]
                    self._fallers[self._column][row] = None
                self._column -= 1

                if self.can_drop():
                    self.change_back()

    def can_drop(self) -> bool:
        'Returns True if the faller can drop one more space, returns False if not.'
        if f'|{self._x}|' in self._fallers[self._column]:
            index = self._fallers[self._column].index(f'|{self._x}|')
            if index < len(self._game.list()[0])-1:
                if self._game.list()[self._column][index+1] == None:
                    return True
            else:
                return False
        elif f'[{self._x}]' in self._fallers[self._column]:
            index = self._fallers[self._column].index(f'[{self._x}]')
            if index < len(self._game.list()[0])-1:
                if self._game.list()[self._column][index+1] == None:
                    return True
        else:
            if self._game.list()[self._column][0] == None:
                return True
        return False

    def x_coords(self) -> tuple[int] | None:
        'Returns the row and column of the first item in the faller if the faller is landing.'
        if f'|{self._x}|' in self._fallers[self._column]:
            return (self._fallers[self._column].index(f'|{self._x}|'), self._column)
        else:
            return None

    def update_game(self, game: Game):
        'Combines the faller and game lists, adding the faller to the game.'
        game.update_game(self)

    def empty_board(self):
        'Changes all elements of the fallers list to None.'
        for col in range(len(self._fallers)):
            for row in range(len(self._fallers[0])):
                self._fallers[col][row] = None

    def change_back(self):
        'Changes all elements of the faller from |X| to [X]'
        for col in range(len(self._fallers)):
            for row in range(len(self._fallers[0])):
                if self._fallers[col][row] == f'|{self._x}|':
                    self._fallers[col][row] = f'[{self._x}]'
                if self._fallers[col][row] == f'|{self._y}|':
                    self._fallers[col][row] = f'[{self._y}]'
                if self._fallers[col][row] == f'|{self._z}|':
                    self._fallers[col][row] = f'[{self._z}]'

    def empty(self) -> bool:
        'Returns True if all elements of the fallers list are None and False if not.'
        for col in self._fallers:
            for space in col:
                if space != None:
                    return False
        return True

    def _drop(self) -> None:
        for row in range(len(self._fallers[self._column])-1, 0, -1):
            self._fallers[self._column][row] = self._fallers[self._column][row-1]
            self._fallers[self._column][row-1] = None

    def _find_empty(self) -> int:
        'Finds the next empty space in the column.'
        for row in range(len(self._fallers[self._column])):
            if self._fallers[self._column][row] == None:
                return row

    def _z_in_faller(self) -> bool:
        'Returns True if the last jewel of the faller is in the board and False if not.'
        for column in self._fallers:
            if (f'[{self._z}]' in column) or (f'|{self._z}|' in column):
                return True
        return False

    def _landing(self) -> bool:
        'Returns True if the faller is unable to drop any more, but has not yet landed.'
        for column in self._fallers:
            if f'|{self._z}|' in column:
                return True
        return False

    def _change_to_dropped(self) -> None:
        'Changes from [X] to |X|'
        for col in range(len(self._fallers)):
            for row in range(len(self._fallers[0])):
                if self._fallers[col][row] == f'[{self._x}]':
                    self._fallers[col][row] = f'|{self._x}|'
                if self._fallers[col][row] == f'[{self._y}]':
                    self._fallers[col][row] = f'|{self._y}|'
                if self._fallers[col][row] == f'[{self._z}]':
                    self._fallers[col][row] = f'|{self._z}|'

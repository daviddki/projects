import pygame
import project5game
import random

class ColumnsGame:
    def __init__(self):
        self._state = project5game.Game()
        self._running = True
        self._image = pygame.image.load('game_grid.png')
        self._red = pygame.image.load('red.png')
        self._orange = pygame.image.load('orange.png')
        self._yellow = pygame.image.load('yellow.png')
        self._green = pygame.image.load('green.png')
        self._blue = pygame.image.load('blue.png')
        self._purple = pygame.image.load('purple.png')
        self._pink = pygame.image.load('pink.png')
        self._white = pygame.image.load('white.png')
        self._land = pygame.image.load('land.png')

    def run(self) -> None:
        'Runs the game.'
        pygame.init()

        try:
            self._surface = pygame.display.set_mode((700, 700), pygame.RESIZABLE)
            self._faller = self._create_new_faller()

            self._resize_images()

            clock = pygame.time.Clock()

            while self._running:
                clock.tick(1)

                self._handle_events()

                drop_space = self._faller.x_coords()
                self._faller.drop_faller()

                self._display_screen(drop_space)
                if self._state.has_matches():
                    self._state.remove_matches()
                    self._state.drop_all_jewels()
                    self._state.check_matches()

                else:   
                    if (self._faller.empty()) and (not self._state.full()):
                        self._faller = self._create_new_faller()
                    elif self._state.full():
                        raise project5game.GameOverError

                pygame.display.flip()

        except project5game.GameOverError:
            print('GAME OVER')

        finally:
            pygame.quit()

    def _resize_images(self):
        'Resizes all images to fit the dimensions of the game window.'
        height: int = self._surface.get_height()
        width: int = self._surface.get_width()
        frac_x: float = 0.07143*width
        frac_y: float = 0.07143*height
        self._image = pygame.transform.scale(self._image, (width*0.47, height))
        self._red = pygame.transform.scale(self._red, (frac_x, frac_y))
        self._orange = pygame.transform.scale(self._orange, (frac_x, frac_y))
        self._yellow = pygame.transform.scale(self._yellow, (frac_x, frac_y))
        self._green = pygame.transform.scale(self._green, (frac_x, frac_y))
        self._blue = pygame.transform.scale(self._blue, (frac_x, frac_y))
        self._purple = pygame.transform.scale(self._purple, (frac_x, frac_y))
        self._pink = pygame.transform.scale(self._pink, (frac_x, frac_y))
        self._white = pygame.transform.scale(self._white, (frac_x, frac_y))
        self._land = pygame.transform.scale(self._land, (frac_x, frac_y))

    def _display_screen(self, drop_space: tuple[int]):
        'Fills background color, blits the game grid on top, then displays the game on top of that.'
        self._surface.fill(pygame.Color(125, 110, 60))
        self._surface.blit(self._image, ((self._surface.get_width()-self._image.get_width())/2, 0))

        self._show_game(drop_space)

    def _handle_events(self) -> None:
        'Handles all events from past second.'
        for event in pygame.event.get():
            self._handle_event(event)

    def _handle_event(self, event) -> None:
        '''Handles events from past second,
        and reacts accordingly if events are
        quit, resize, left key down, right key
        down, or space bar down.'''
        if event.type == pygame.QUIT:
            self._end()
        elif event.type == pygame.VIDEORESIZE:
            self._surface = pygame.display.set_mode(event.size, pygame.RESIZABLE)
            self._resize_images()
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_LEFT:
                self._faller.move_left()
            if event.key == pygame.K_RIGHT:
                self._faller.move_right()
            if event.key == pygame.K_SPACE:
                self._faller.rotate()

#            if event.key == pygame.K_DOWN:
#                self._faller.drop_faller()

    def _create_new_faller(self) -> project5game.Faller:
        '''Creates a new faller with different color jewels
        in a column that is not filled.'''
        x = random.randint(0, 6)
        while True:
            y = random.randint(0, 6)
            if y != x:
                break
        while True:
            z = random.randint(0, 6)
            if (z != x) and (z != y):
                break
        
        x = self._assign_letter(x)
        y = self._assign_letter(y)
        z = self._assign_letter(z)

        while True:
            column: int = random.randint(0, 5)
            if self._state.list()[column][0] == None:
                break

        return project5game.Faller(self._state, column, x, y, z)

    def _assign_letter(self, number: int) -> str:
        'Assigns a letter to the given number.'
        if number == 0:
            return 'S'
        if number == 1:
            return 'T'
        if number == 2:
            return 'V'
        if number == 3:
            return 'W'
        if number == 4:
            return 'X'
        if number == 5:
            return 'Y'
        if number == 6:
            return 'Z'

    def _show_game(self, drop_space: tuple[int]) -> None:
        '''Displays the items in the game board and the faller.
        If the faller has landed, then the game shows a corresponding visual effect.'''
        for col in range(6):
            for row in range(13):
                frac_x: float = 0.2743 + (0.07643*col)
                frac_y: float = 0.007143 + (0.07643*row)

                if drop_space != None:
                    if (drop_space[0] == row) and (drop_space[1] == col):
                        self._surface.blit(self._land,
                                           (frac_x*self._surface.get_width(),
                                            (frac_y+0.03)*self._surface.get_height()))
            
                item: str | None = self._state.list()[col][row]
                self._display_jewel(item, frac_x, frac_y)

                item: str | None = self._faller.list()[col][row]
                self._display_jewel(item, frac_x, frac_y)

    def _display_jewel(self, item: str, frac_x: float, frac_y: float) -> None:
        'Displays the correct jewel in the given location.'
        if item != None:
            color_image = self._determine_color(item)
            self._surface.blit(color_image, (frac_x*self._surface.get_width(),
                                             frac_y*self._surface.get_height()))

    def _determine_color(self, item: str) -> str:
        'Determines and returns the color that the jewel should be.'
        if not item.startswith('*'):
            if 'S' in item:
                return self._red
            if 'T' in item:
                return self._orange
            if 'V' in item:
                return self._yellow
            if 'W' in item:
                return self._green
            if 'X' in item:
                return self._blue
            if 'Y' in item:
                return self._purple
            if 'Z' in item:
                return self._pink
        else:
            return self._white

    def _end(self) -> None:
        self._running = False

if __name__ == '__main__':
    ColumnsGame().run()

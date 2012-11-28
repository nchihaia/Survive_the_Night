#!/bin/bash
cat ../shared/config.js \
    ../shared/helpers.js \
    ../shared/entity_types.js \
    ../shared/charclasses.js \
    ../shared/minions.js \
    ../shared/collectibles.js \
    ../client/game/main.js \
    ../client/game/assets.js \
    ../client/game/ui/time.js \
    ../client/game/ui/char.js \
    ../client/game/entities/entity.js \
    ../client/game/entities/players/player.js \
    ../client/game/entities/players/survivor.js \
    ../client/game/entities/players/director.js \
    ../client/game/entities/minions/minion.js \
    ../client/game/projectiles/bullet.js \
    ../client/game/collectibles/collectible.js \
    ../client/game/collectibles/ammo.js \
    ../client/game/collectibles/medkit.js \
    ../client/game/screens/play.js \
    ../client/game/screens/lobby.js \
    ../client/game/game_client/game_client.js \
    ../client/game/game_client/intervals.js \
    ../client/game/game_client/listeners.js | uglifyjs -o ../client/survive_the_night.min.js

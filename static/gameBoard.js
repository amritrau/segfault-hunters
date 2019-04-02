//gameboard scene: this is the actual canvas for the game!
var GameBoard = new Phaser.Class ({
    Extends: Phaser.Scene,

    initialize:

    function Board () {
        // this names the scene we are in
        Phaser.Scene.call(this, { key: 'board' });

        // this allows clicking in our game
        this.allowClick = true;

        //this is where all of the objects specific to our scene will appear
        this.healthBar;
        this.player;
        this.allPlayersInfo;
        this.nPlayers;
        this.otherPlayers = {};
        this.tip;
        this.gameData;
        this.charInfo;
        this.infoBox;
        this.startSpots = [[490, 220], [530, 220], [570, 220], [510, 260], [550, 260]]; //list of x, y coordinates for 5 players

        // Player location coordinates (row = player number, even columns are x coords, odd columns are y coords)
        this.allSpots = [[336.909,199.411,383.466,117.760,682.109,117.760,728.666,199.411,457.000,342.000,560.000,342.000],
                         [361.909,156.110,408.466, 74.459,657.109, 74.459,703.666,156.110,507.000,342.000,610.000,342.000],
                         [382.965,197.134,429.522,115.483,636.053,115.483,682.610,197.134,482.000,380.747,585.000,380.747],
                         [406.191,239.411,452.748,157.760,612.827,157.760,659.384,239.411,457.000,422.000,560.000,422.000],
                         [431.191,196.110,477.748,114.459,587.827,114.459,634.384,196.110,507.000,422.000,610.000,422.000]
                     ];

        //y coordinates of all possible spots on health bar
        this.hpSpots = [585];
        this.hpStart = 585;
        this.zoneCards = [[],[],[]];
        this.zoneSpots = [[382.000, 201.500, 433.000, 113.250],
                          [633.000, 113.250, 684.250, 201.750],
                          [482.000, 382.712, 584.000, 382.712]];
    },

    //function to initialize the data sent into gameboard from waiting room
    init: function (data)
    {
        this.gameData = data;
        if("private" in this.gameData) this.charInfo = this.gameData.private.character;
        this.allPlayersInfo = this.gameData.public.players;

        // DEBUGGING
        // console.log(this.charInfo);
        // console.log(typeof this.charInfo);
        // console.log(this.gameData.public);
        // console.log(this.gameData.public.players);
        // var key = Object.keys(this.otherPlayersInfo)[0];
        // console.log(this.otherPlayersInfo[key].user_id);
        // console.log(Object.keys(this.otherPlayersInfo).length);
        // console.log(this.gameData.private);
    },

    //the preload function is where all images that will be used in the game are loaded into
    preload: function () {
        // url where gfx resources are stored
        var gfx = "https://s3.amazonaws.com/shadowhunters.gfxresources/";

        // load background and health bar
        this.load.svg('background', gfx + 'background.svg', {width: 1066, height: 600});
        this.load.image("customTip", "/static/assets/customTip.png");
        this.load.image("popup_right", "/static/assets/popup_right.png");
        this.load.image("popup_left", "/static/assets/popup_left.png");
        this.load.image('text', '/static/assets/text.png');
        this.load.image('health', '/static/assets/health.png');

        // load arsenal
        this.load.image('arsenal', '/static/assets/arsenal.png');

        // load the location cards
        this.load.svg('Hermit\'s Cabin', gfx + 'hermits_cabin.svg', {width: 101, height: 150});
        this.load.svg('Underworld Gate', gfx + 'underworld_gate.svg', {width: 101, height: 150});
        this.load.svg('Church', gfx + 'church.svg', {width: 101, height: 150});
        this.load.svg('Cemetery', gfx + 'cemetery.svg', {width: 101, height: 150});
        this.load.svg('Weird Woods', gfx + 'weird_woods.svg', {width: 101, height: 150});
        this.load.svg('Erstwhile Altar', gfx + 'erstwhile_altar.svg', {width: 101, height: 150});

        // load player sprites and hp trackers
        this.load.svg('player1', gfx + 'white-person.svg', {width: 50.5, height: 37.5});
        this.load.svg('player2', gfx + 'black-person.svg', {width: 50.5, height: 37.5});
        this.load.svg('player3', gfx + 'green-person.svg', {width: 50.5, height: 37.5});
        this.load.svg('player4', gfx + 'blue-person.svg', {width: 50.5, height: 37.5});
        this.load.svg('player5', gfx + 'pink-person.svg', {width: 50.5, height: 37.5});
        this.load.svg('circle1', gfx + 'white_circle.svg', {width: 123.633, height: 123.633});
        this.load.svg('circle2', gfx + 'black_circle.svg', {width: 123.633, height: 123.633});
        this.load.svg('circle3', gfx + 'green_circle.svg', {width: 123.633, height: 123.633});
        this.load.svg('circle4', gfx + 'blue_circle.svg', {width: 123.633, height: 123.633});
        this.load.svg('circle5', gfx + 'pink_circle.svg', {width: 123.633, height: 123.633});

        this.load.svg('hpp1', gfx + 'whiteDot.svg', {width: 15, height: 15});
        this.load.svg('hpp2', gfx + 'blackDot.svg', {width: 15, height: 15});
        this.load.svg('hpp3', gfx + 'greenDot.svg', {width: 15, height: 15});
        this.load.svg('hpp4', gfx + 'blueDot.svg', {width: 15, height: 15});
        this.load.svg('hpp5', gfx + 'pinkDot.svg', {width: 15, height: 15});

        this.load.image('box', '/static/assets/box.png');

        this.load.svg('charImage', gfx + 'charImage.svg', {width: 123.633, height: 123.633});
        this.load.svg('8hp', gfx + '8hp.svg', {width: 30.14, height: 30.14});
        this.load.svg('10hp', gfx + '8hp.svg', {width: 30.14, height: 30.14});
        this.load.svg('11hp', gfx + '8hp.svg', {width: 30.14, height: 30.14});
        this.load.svg('12hp', gfx + '12hp.svg', {width: 30.14, height: 30.14});
        this.load.svg('13hp', gfx + '13hp.svg', {width: 30.14, height: 30.14});
        this.load.svg('14hp', gfx + '14hp.svg', {width: 30.14, height: 30.14});
        this.load.svg('A', gfx + 'a.svg', {width: 36.657, height: 36.657});
        this.load.svg('B', gfx + 'a.svg', {width: 36.657, height: 36.657});
        this.load.svg('C', gfx + 'a.svg', {width: 36.657, height: 36.657});
        this.load.svg('U', gfx + 'v.svg', {width: 36.657, height: 36.657});
        this.load.svg('V', gfx + 'v.svg', {width: 36.657, height: 36.657});
        this.load.svg('W', gfx + 'v.svg', {width: 36.657, height: 36.657});
        this.load.svg('E', gfx + 'f.svg', {width: 36.657, height: 36.657});
        this.load.svg('F', gfx + 'f.svg', {width: 36.657, height: 36.657});
        this.load.svg('G', gfx + 'g.svg', {width: 36.657, height: 36.657});
        // will replace with actual art as I make them
        // possible later implementation: loop through dumped list of playable characters to load images?
        this.load.image('Allie', '/static/assets/Allie.png');
        this.load.image('George', '/static/assets/George.png');
        this.load.image('Fu-ka', '/static/assets/Fu-ka.png');
        this.load.image('Valkyrie', '/static/assets/Valkyrie.png');
        this.load.image('Vampire', '/static/assets/Vampire.png');
        this.load.image('Bob', '/static/assets/anon.png');
        this.load.image('Catherine', '/static/assets/anon.png');
        this.load.image('Franklin', '/static/assets/anon.png');
        this.load.image('Ellen', '/static/assets/anon.png');
        this.load.image('Ultra Soul', '/static/assets/anon.png');
        this.load.image('Werewolf', '/static/assets/anon.png');
        //this.load.svg('Allie', '/static/assets/Allie.svg', {width: 123, height: 123});
    },

    //the create function is where everything is added to the canvas
    create: function () {
        var self = this;

        //this adds our background image. the x, y coordinates provided are the center of the canvas
        var background = this.add.image(533, 300, 'background');
        background.setScale(1);

        // Add healthbar
        this.healthBar = this.makeHealthBar();
        this.healthBar.on('clicked', this.clickHandler, this.box);

        // Place locations based on given order

        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 2; j++) {
                this.zoneCards[i][j] = this.makeZones(i,j);
                this.zoneCards[i][j].on('clicked', this.clickHandler, this.zoneCards[i][j]);
            }
        }

        //this loop creates all players: self and enemies.
        sorted_keys = Object.keys(this.allPlayersInfo).sort(); // Hack to force keys into a deterministic order
        this.nPlayers = Object.keys(this.allPlayersInfo).length;
        var count = 0;
        for(var i = 0; i < this.nPlayers; i++) {
            var key = sorted_keys[i];
            if(("private" in this.gameData) && this.allPlayersInfo[key].user_id === this.gameData.private.user_id) {
                this.player = this.makePlayer(this.allPlayersInfo[key].user_id,
                                              this.allPlayersInfo[key], i+1);
                this.player.key = key;
                this.player.on('clicked', this.clickHandler, this.player);
            }
            else {
                this.otherPlayers[key] = this.makePlayer(this.allPlayersInfo[key].user_id,
                                                         this.allPlayersInfo[key], i+1);
                this.otherPlayers[key].on('clicked', this.clickHandler, this.otherPlayers[key]);
                count++;
            }
        }

        //this is what makes the box appear when character is clicked. See function clickHandler below
        this.input.on('gameobjectup', function (pointer, gameObject) {
            gameObject.emit('clicked', gameObject);
        }, this);

        // Only create the aresenal and character card if
        // this user is not a spectator
        if("private" in this.gameData)
        {
            // Add arsenal to screen
            this.add.image(533, 537.5, 'arsenal');

            //create the information box for the bottom left corner
            this.infoBox = this.add.image(100, 537.5, 'box');

            //amrit sets character allegance to a number. we convert it to a team
            if(this.charInfo.alleg == 1){
                this.charInfo.alleg = "Neutral";
            }
            else if (this.charInfo.alleg == 0) {
                this.charInfo.alleg = "Shadow";
            }
            else {
                this.charInfo.alleg = "Hunter";
            }
            //enable data to be stored in this box. I'm not sure if this is necessary; if it isn't we can delete these set lines below
            this.infoBox.setDataEnabled();
            this.infoBox.data.set("name", this.charInfo.name);
            this.infoBox.data.set("team", this.charInfo.alleg);
            this.infoBox.data.set("win", this.charInfo.win_cond_desc);
            this.infoBox.data.set("special", "none"); //not yet implemented

            //create the text variables
            var text = this.add.text(10, 470, '', {
                font: '12px Arial',
                fill: '#FFFFFF',
                wordWrap: { width: 180, useAdvancedWrap: true }
            });
            var name = this.add.text(5, 460, this.infoBox.data.get('name'), {
                font:'16px Arial' ,
                fill: '#FFFFFF'
            });

            // Adding placeholder text to go in equipment slots
            this.equip_text = [];
            this.num_equip_slots = 6;
            for(var i = 0; i < this.num_equip_slots; i++)
            {
                this.equip_text[i] = this.add.text(235 + i*100, 537.5, '', {
                    font: '12px Arial',
                    fill: '#FFFFFF',
                    wordWrap: { width: 80, useAdvancedWrap: true }
                });
            }

            //set the text for inside of the box
            text.setText([
                'Team: ' + this.infoBox.data.get('team'),
                'Win Condition: ' + this.infoBox.data.get('win'), "\n",
                'Special Ability: ' + this.infoBox.data.get('special')
            ]);

        this.add.image(100, 366.975, "circle" + String(this.player.number));
        this.add.image(100, 366.975, this.charInfo.name);
        this.add.image(60.442, 322.289, this.charInfo.name[0]);
        this.add.image(137.489, 412.722, String(this.charInfo.max_damage) + "hp");

            this.add.image(100, 366.975, "charImage");
            this.add.image(60.442, 322.289, this.charInfo.name[0]);
            this.add.image(137.489, 412.722, String(this.charInfo.max_damage) + "hp");

            //align the text inside of our information box
            Phaser.Display.Align.In.TopCenter(name, this.infoBox);
            Phaser.Display.Align.In.TopLeft(text, this.add.zone(110, 560, 200, 130));
        }

        // Initial update to synchronize spectators
        self.updateBoard(this.gameData.public);

        // Socket receiver for future updates
        socket.on('update', function(data) {
            self.updateBoard(data);
        });
    },

    makeHealthBar: function() {
        var sprite  = this.add.image(966, 300, 'health');
        sprite.infoBox = this.add.image(750, 150, 'text');
        sprite.infoBox.setVisible(false);
        sprite.infoBox.depth = 30;
        sprite.displayInfo = this.add.text(700, 30, " ", { font: '12px Arial', fill: '#FFFFFF', wordWrap: { width: 250, useAdvancedWrap: true }});

        sprite.displayInfo.setText(["Player: " + this.gameData.public.characters[0].name, "Dies At HP: " + this.gameData.public.characters[0].max_damage, "\n",
            "Player: " + this.gameData.public.characters[1].name, "Dies At HP: " + this.gameData.public.characters[1].max_damage, "\n",
            "Player: " + this.gameData.public.characters[2].name, "Dies At HP: " + this.gameData.public.characters[2].max_damage, "\n",
            "Player: " + this.gameData.public.characters[3].name, "Dies At HP: " + this.gameData.public.characters[3].max_damage, "\n",
            "Player: " + this.gameData.public.characters[4].name, "Dies At HP: " + this.gameData.public.characters[4].max_damage
        ]);
        sprite.displayInfo.setVisible(false);
        sprite.displayInfo.depth = 30;
        sprite.setInteractive();
        return sprite;
    },

    // this adds the zones to the board and makes them interactive on click
    makeZones: function(zone_num, card_num) {
        var zone = this.add.image(this.zoneSpots[zone_num][card_num*2],this.zoneSpots[zone_num][card_num*2 + 1], this.gameData.public.zones[zone_num][card_num].name);
        if (zone_num == 0) {
            zone.setScale(1).angle = -60;
            zone.infoBox = this.add.image(zone.x-90, zone.y, "popup_left");
            zone.displayInfo = this.add.text(zone.infoBox.x - 80, zone.infoBox.y - 40, " ", { font: '12px Arial', fill: '#FFFFFF', wordWrap: { width: 130, useAdvancedWrap: true }});
        }
        else if (zone_num == 1) {
            zone.setScale(1).angle = 60;
            zone.infoBox = this.add.image(zone.x+90, zone.y, "popup_right");
            zone.displayInfo = this.add.text(zone.infoBox.x - 60, zone.infoBox.y - 40, " ", { font: '12px Arial', fill: '#FFFFFF', wordWrap: { width: 130, useAdvancedWrap: true }});
        }
        else {
            if(card_num == 0) {
                zone.infoBox = this.add.image(zone.x-90, zone.y, "popup_left");
                zone.displayInfo = this.add.text(zone.infoBox.x - 80, zone.infoBox.y - 40, " ", { font: '12px Arial', fill: '#FFFFFF', wordWrap: { width: 130, useAdvancedWrap: true }});
            }
            else {
                zone.infoBox = this.add.image(zone.x+90, zone.y, "popup_right");
                zone.displayInfo = this.add.text(zone.infoBox.x - 60, zone.infoBox.y - 40, " ", { font: '12px Arial', fill: '#FFFFFF', wordWrap: { width: 130, useAdvancedWrap: true }});
            }
        }

        zone.displayInfo.setText([
            "Area: " + this.gameData.public.zones[zone_num][card_num].name,
            this.gameData.public.zones[zone_num][card_num].desc
        ]);

        zone.infoBox.setVisible(false);
        zone.displayInfo.setVisible(false);
        zone.infoBox.depth = 30;
        zone.displayInfo.depth = 30;
        zone.setInteractive();
        return zone;
    },

    //the makePlayer function is what creates our sprite and adds him to the board.
    makePlayer: function (name, data, num) {
        var sprite = this.add.sprite(this.startSpots[num-1][0], this.startSpots[num-1][1], 'player' + String(num));
        sprite.hpTracker = this.add.image(900 + (35*(num-1)), this.hpStart, 'hpp' + String(num));

        //our player's name
        sprite.name = name;
        sprite.number = num;

        //this is the information that will appear inside of the info box
        sprite.info = data;
        sprite.spots = {};

        var count = 0;

        for(var i = 0; i < 3; i++) {
            sprite.spots[this.gameData.public.zones[i][0].name] = {x: this.allSpots[num-1][count], y: this.allSpots[num-1][count+1]};
            sprite.spots[this.gameData.public.zones[i][1].name] = {x: this.allSpots[num-1][count+2], y: this.allSpots[num-1][count+3]};
            count += 4;
        }

        //this creates the infobox, i.e. the box that will appear when we click on him.
        sprite.infoBox = this.add.image(sprite.x, sprite.y -60, "customTip");
        sprite.infoBox.setVisible(false);
        sprite.displayInfo = this.add.text(sprite.infoBox.x - 120, sprite.infoBox.y - 40, " ", { font: '12px Arial', fill: '#FFFFFF', wordWrap: { width: 250, useAdvancedWrap: true }});
        sprite.displayInfo.setText([
            "Player: " + sprite.name,
            "Equipment: None"
        ]);
        sprite.displayInfo.setVisible(false);

        //this makes the sprite interactive so that we can click on them
        sprite.setInteractive();
        sprite.depth = 10;
        sprite.infoBox.depth = 20;
        sprite.displayInfo.depth = 20;
        return sprite;
    },

    //updates information about each player
    updatePlayer: function (player, data) {

        // Update name (in case replaced by CPU)
        player.name = data.user_id;

        // Move player
        if(Object.keys(data.location).length != 0) {
            if(!player.info.location.name || player.info.location.name !== data.location.name) {
                player.infoBox.setVisible(false);
                player.displayInfo.setVisible(false);
            }
            player.x = player.spots[data.location.name].x;
            player.y = player.spots[data.location.name].y;
            if(player.y-60-45 < 0) {
                player.infoBox.angle = 180;
                player.infoBox.x = player.x;
                player.infoBox.y = player.y + 60;
                player.displayInfo.x = player.infoBox.x - 120;
                player.displayInfo.y = player.infoBox.y - 20;
            }
            else {
                if (player.infoBox.angle != 0) {
                    player.infoBox.angle = 0;
                }
                player.infoBox.x = player.x;
                player.infoBox.y = player.y -60;
                player.displayInfo.x = player.infoBox.x - 120;
                player.displayInfo.y = player.infoBox.y - 40;
            }
        }

        // Update hp
        player.hpTracker.y = this.hpStart - 40*data.damage;

        // Kill player if dead
        if(data.state == 0) {
            player.alpha = 0.4;
            player.hpTracker.alpha = 0.4;
            player.infoBox.alpha = 0.4;
            player.displayInfo.alpha = 0.4;
            player.x = this.startSpots[player.number-1][0];
            player.y = this.startSpots[player.number-1][1];
            player.infoBox.x = player.x;
            player.infoBox.y = player.y -60;
            player.displayInfo.x = player.infoBox.x - 120;
            player.displayInfo.y = player.infoBox.y - 40;
        }

        // Update arsenal
        var datasize = data.equipment.length;
        if(this.player && player == this.player) {

            // Set equip text in box to name of equipment
            for(var i = 0; i < datasize; i++) {
                this.equip_text[i].setText([data.equipment[i].title]);
            }

            // Empty equip text in rest of boxes
            for(var i = datasize; i < this.num_equip_slots; i++) {
                this.equip_text[i].setText([""]);
            }
        }

        // Update infobox
        player.info = data;
        if(Object.keys(player.info.location).length == 0) {
            player.info.location.name = "None";
        }

        var nEquip = player.info.equipment.length;
        if(nEquip == 0) {
            player.info.equipment.list = "None";
        }
        else {
            player.info.equipment.list = "";
            for(var i = 0; i < nEquip; i++) {
                player.info.equipment.list += player.info.equipment[i].title;
                if(i < nEquip-1){
                    player.info.equipment.list += ", ";
                }
            }
        }

        player.displayInfo.setText([
            "Player: " + player.name,
            "Equipment: " + player.info.equipment.list
        ]);
    },

    //for each update, change parts of the board that need to be redrawn.
    updateBoard: function(data) {
        //loop through each player and see if there are things to update
        // console.log(data);
        this.allPlayersInfo = data.players;
        for(var i = 0; i < this.nPlayers; i++){
            var key = Object.keys(this.allPlayersInfo)[i];
            if(this.player && key === this.player.key) {
                //update self
                this.updatePlayer(this.player, this.allPlayersInfo[key]);
            }
            else {
                //update other players
                this.updatePlayer(this.otherPlayers[key], this.allPlayersInfo[key]);
            }
        }
    },
    //if player clicked and box is visible, make invisible. if box is invisible, make visible
    clickHandler: function (player)
    {
        if(player.infoBox.visible == false)
        {
            player.infoBox.setVisible(true);
            player.displayInfo.setVisible(true);
        }
        else
        {
            player.infoBox.setVisible(false);
            player.displayInfo.setVisible(false);
        }
    }
});

var GameBoard = new Phaser.Class ({
    Extends: Phaser.Scene,

    initialize:

    function Board ()
    {
        // this names the scene we are in
        Phaser.Scene.call(this, { key: 'board' });

        // this allows clicking in our game
        this.allowClick = true;

        //this is where all of the objects specific to our scene will appear
        this.player;
        this.tip;
        this.charInfo;
        this.infoBox;

    },

    //the preload function is where all images that will be used in the game are loaded into
    preload: function () {
        this.load.image('background', 'https://s3.amazonaws.com/shadowhunters.gfxresources/background.jpg');
        this.load.image('customTip', '/static/assets/customTip.png');
        this.load.spritesheet('dude',
            '/static/assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
        this.load.image('0', '/static/assets/zero.png');
        this.load.image('1', '/static/assets/one.png');
        this.load.image('2', '/static/assets/two.png');
        this.load.image('3', '/static/assets/three.png');
        this.load.image('4', '/static/assets/four.png');
        this.load.image('5', '/static/assets/five.png');
        this.load.image('6', '/static/assets/six.png');
        this.load.image('7', '/static/assets/seven.png');
        this.load.image('8', '/static/assets/eight.png');
        this.load.image('9', '/static/assets/nine.png');
        this.load.image('10', '/static/assets/ten.png');
        this.load.image('11', '/static/assets/eleven.png');
        this.load.image('12', '/static/assets/twelve.png');
        this.load.image('13', '/static/assets/thirteen.png');
        this.load.image('14', '/static/assets/fourteen.png');
        this.load.image('text', '/static/assets/text.png');




        this.load.image('box', '/static/assets/box.png');
    },

    //the create function is where everything is added to the canvas
    create: function () {
        //this adds our background image. the x, y coordinates provided are the center of the canvas
        this.add.image(400, 300, 'background');

        this.add.image(900,20, '14');
        this.add.image(900,60, '13');
        this.add.image(900,100, '12');
        this.add.image(900,140, '11');
        this.add.image(900,180, '10');
        this.add.image(900,220, '9');
        this.add.image(900,260, '8');
        this.add.image(900,300, '7');
        this.add.image(900,340, '6');
        this.add.image(900,380, '5');
        this.add.image(900,420, '4');
        this.add.image(900,460, '3');
        this.add.image(900,500, '2');
        this.add.image(900,540, '1');
        this.add.image(900,580, '0');


       // this.player = this.add.sprite(100, 450, 'dude');
       // this.player.name = "player1";

        //this.makeBox();
       // this.block = this.add.image(this.player.x +20, this.player.y, "text");
       // this.block.setVisible(false);
       // this.player.on('clicked', this.clickHandler, this.block);



        //call our makePlayer() function

        this.makePlayer();

        //create the click information for our character
        this.player.infoBox = this.add.image(this.player.x, this.player.y -60, "customTip");
        this.player.infoBox.setVisible(false);

        //this sets the player to reveal the box when he is clicked
        this.player.on('clicked', this.clickHandler, this.player.infoBox);

        //this is what makes the box appear when character is clocked. See function clickHandler below
        this.input.on('gameobjectup', function (pointer, gameObject) {
            gameObject.emit('clicked', gameObject);
        }, this);

        //create the information box for the bottom left corner
        this.infoBox = this.add.image(75, 525, 'box');

        //enable data to be stored in this box. I'm not sure if this is necessary; if it isn't we can delete these set lines below
        this.infoBox.setDataEnabled();
        this.infoBox.data.set("name", "NAME"); //will be a call to the backend
        this.infoBox.data.set("team", "S/H/N"); //will be a call to the backend
        this.infoBox.data.set("win", "Win condition will appear here"); //will be a call to the backend
	this.infoBox.data.set("special", "special ability"); //will be a call to the backend

        //create the text variables
        var text = this.add.text(10, 470, '', { font: '12px Arial', fill: '#FFFFFF', wordWrap: { width: 150, useAdvancedWrap: true }});
        var name = this.add.text(5, 460, this.infoBox.data.get('name'), { font:'16px Arial' ,fill: '#FFFFFF'});

        //set the text for inside of the box
        text.setText([
            'Team: ' + this.infoBox.data.get('team'),
            'Win Condition: ' + this.infoBox.data.get('win'),
		'Special Ability: ' + this.infoBox.data.get('special')
        ]);

        //align the text inside of our information box
        Phaser.Display.Align.In.TopCenter(name, this.infoBox);
        Phaser.Display.Align.In.TopLeft(text, this.add.zone(70, 545, 130, 130));

    },

    makeBox: function() {
        var box  = this.add.box(800, 20, 'text');
        box.name = 'text';
        box.setInteractive();
        this.player = box;
    },


    //the makePlayer function is what creates our sprite and adds him to the board.

    makePlayer: function () {
        var sprite = this.add.sprite(300, 400, 'dude');

        //our player's name
        sprite.name = "player1";

        //this is the information that will appear inside of the info box
        sprite.info = "eek";

        //this creates the infobox, i.e. the box that will appear when we click on him.
        sprite.infobox;

        //this makes the sprite interactive so that we can click on him
        sprite.setInteractive();
        this.player = sprite;
    },

    //if player clicked and box is visible, make invisible. if box is invisible, make visible
    clickHandler: function (box)
    {
        if(this.visible == false)
        {
            this.setVisible(true);
        }
        else
        {
            this.setVisible(false);
        }
    }
});

//create game configurations
var config = {
    type: Phaser.CANVAS,
    width: 1066,
    height: 600,
    pixelArt: true,
    parent: 'board',
    scene: [ GameBoard ]
};

//this starts the game
var game = new Phaser.Game(config);

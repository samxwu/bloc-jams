var setSong = function(songNumber) {
    
    if (currentSoundFile) {
         currentSoundFile.stop();
     }
    
    currentlyPlayingSongNumber = parseInt(songNumber);
     
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
     // #1
     currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
         // #2
         formats: [ 'mp3' ],
         preload: true
     });
    
    setVolume(currentVolume);
 };

var seek = function(time) {
     if (currentSoundFile) {
         currentSoundFile.setTime(time);
     }
 }; 

var setVolume = function(volume){
    if (currentSoundFile){
        currentSoundFile.setVolume(volume);
    }
};

var setCurrentTimeInPlayerBar = function(currentTime){
    $('.seek-control .current-time').text(filterTimeCode(currentTime));
};

var setTotalTimeInPlayerBar = function(totalTime){
    $('.seek-control .total-time').text(filterTimeCode(totalTime));
};

var filterTimeCode = function(timeInSeconds){
    currTime = parseFloat(timeInSeconds);
    var minutes = Math.floor(currTime/60);
    var seconds = Math.floor(currTime-(minutes*60));
    
    return minutes +":"+(Array(2+1).join('0')+seconds).slice(-2);
}; 


var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
}


var createSongRow = function(songNumber, songName, songLength) {
     var template =
        '<tr class="album-view-song-item">'
      + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      + '  <td class="song-item-title">' + songName + '</td>'
      + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
      + '</tr>'
      ;
 
    var $row = $(template);
    
    
    
    var clickHandler = function() {
	   var songNumber = parseInt($(this).attr('data-song-number'));

	   if (currentlyPlayingSongNumber  !== null) {
		// Revert to song number for currently playing song because user started playing new song.
	
        var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
		currentlyPlayingCell.html(currentlyPlayingSongNumber);
	   }

        // user clicks song != current song
        if (currentlyPlayingSongNumber !== songNumber) {
		
        var barWidth = $('.volume .seek-bar').width();
                    
        var seekBarFillRatio = currentVolume/100;

        updateSeekPercentage($('.volume .seek-bar'),seekBarFillRatio);
      
        // Switch from Play -> Pause button to indicate new song is playing.
		$(this).html(pauseButtonTemplate);
		setSong(songNumber);
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
        updatePlayerBarSong();
                            
	   } // user clicks pause for currently playing song
        else if (currentlyPlayingSongNumber === songNumber) {
		
            
        if (currentSoundFile.isPaused()){
            $(this).html(pauseButtonTemplate);
            $('.main-controls .play-pause').html(playerBarPauseButton);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
           
        } else {
            $(this).html(playButtonTemplate);
		    $('.main-controls .play-pause').html(playerBarPlayButton);
            currentSoundFile.pause();
           }
        }
    };
    
    
    
    
    var onHover = function(event) {
       var songNumberCell = $(this).find('.song-item-number');
       var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
       if (songNumber !== currentlyPlayingSongNumber) {songNumberCell.html(playButtonTemplate);}
    };
    
    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {songNumberCell.html(songNumber);}
    };
    
     
    // #1
    $row.find('.song-item-number').click(clickHandler);
    // #2
    $row.hover(onHover, offHover);
    // #3
    return $row;
};


var setCurrentAlbum = function(album) {
    
     currentAlbum = album;
     
     var $albumTitle = $('.album-view-title');
     var $albumArtist = $('.album-view-artist');
     var $albumReleaseInfo = $('.album-view-release-info');
     var $albumImage = $('.album-cover-art');
     var $albumSongList = $('.album-view-song-list');
     
     $albumTitle.text(album.title);
     $albumArtist.text(album.artist);
     $albumReleaseInfo.text(album.year + ' ' + album.label);
     $albumImage.attr('src', album.albumArtUrl);
    
     $albumSongList.empty();
     for (var i = 0; i < album.songs.length; i++) {
         var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
         $albumSongList.append($newRow);
     }
};


var trackIndex = function(album, song) {
     return album.songs.indexOf(song);
 };


var updatePlayerBarSong = function() {

    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
    
};


var nextSong = function() {
    
    var getLastSongNumber = function(index) {
        return index == 0 ? currentAlbum.songs.length : index;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex++;
    
    
    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }
    
    // Set a new current song
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    
    // Update the Player Bar information
    updatePlayerBarSong();
    
    /*
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    */
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};


var previousSong = function() {
    
    var getLastSongNumber = function(index) {
        return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex--;
    
    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }
    
    // Set a new current song
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    // Update the Player Bar information
    updatePlayerBarSong();
    
    /*
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    */
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var updateSeekBarWhileSongPlays = function() {
     if (currentSoundFile) {
         // #10
         currentSoundFile.bind('timeupdate', function(event) {
             // #11
             var seekBarFillRatio = this.getTime() / this.getDuration();
             
             
             var $seekBar = $('.seek-control .seek-bar');
 
             updateSeekPercentage($seekBar, seekBarFillRatio);
             setCurrentTimeInPlayerBar(this.getTime());
         });
     }
 };


var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    // #1
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
 
    // #2
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
 };


var setupSeekBars = function() {
     var $seekBars = $('.player-bar .seek-bar');
 
     $seekBars.click(function(event) {
         // #3
         var offsetX = event.pageX - $(this).offset().left;
         
         var barWidth = $(this).width();
         // #4
         var seekBarFillRatio = offsetX / barWidth;
 
         if($(this).parent().attr('class') == 'seek-control'){
             seek(seekBarFillRatio*currentSoundFile.getDuration());
         } else {
             setVolume(seekBarFillRatio*100);
         }
     
         // #5
         updateSeekPercentage($(this), seekBarFillRatio);
     });
   
        $seekBars.find('.thumb').mousedown(function(event) {
         // #8
         var $seekBar = $(this).parent();
 
         // #9
         $(document).bind('mousemove.thumb', function(event){
             var offsetX = event.pageX - $seekBar.offset().left;
             
             var barWidth = $seekBar.width();
             
             var seekBarFillRatio = offsetX / barWidth;
             
             if($(this).parent().attr('class') == 'seek-control'){
             seek(seekBarFillRatio*currentSoundFile.getDuration());
            } else {
             setVolume(seekBarFillRatio*100);
            }
          
             updateSeekPercentage($seekBar, seekBarFillRatio);
         });
            
            
 
         // #10
         $(document).bind('mouseup.thumb', function() {
             $(document).unbind('mousemove.thumb');
             $(document).unbind('mouseup.thumb');
         });
           
     });
  };



// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';

var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';


// Store state of playing songs
var currentlyPlayingSong = null;
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;


var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');


$(document).ready(function() {
     setCurrentAlbum(albumPicasso);
     $previousButton.click(previousSong);
     $nextButton.click(nextSong);
     setupSeekBars();
});

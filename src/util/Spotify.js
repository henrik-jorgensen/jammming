let accessToken = '';
const clientId = '4cf0726ba34a4d358e1e60432541ac4d';
const redirectURI = 'http://localhost:3000/';

const Spotify = {
  getAccessToken() {
    if (!accessToken === '') {
      return accessToken;
    } else if (window.location.href.match(/access_token=([^&]*)/) && window.location.href.match(/expires_in=([^&]*)/)) {
      accessToken = window.location.href.match(/access_token=([^&]*)/)[1];
      let expiresIn = window.location.href.match(/expires_in=([^&]*)/)[1];
      window.setTimeout( () => accessToken = '', expiresIn * 1000);
      window.history.pushState(accessToken, null, '/');
    } else {
      window.location = 'https://accounts.spotify.com/authorize?client_id='
      + clientId + '&response_type=token&scope=playlist-modify-public&redirect_uri='
      + redirectURI;
    }
  },

  search(term) {
    Spotify.getAccessToken();
    return fetch(`https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      }
    }).then(response => {
      return response.json();
    }).then(jsonResponse => {
      if(jsonResponse.tracks) {
        return jsonResponse.tracks.items.map(track => {
          return {
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
          }
        });
      }
      return [];
    });
  },

  savePlaylist(playlistName, trackURIs) {
    Spotify.getAccessToken();
    if(playlistName === '' || trackURIs === '') {
      return;
    } else {
      /* Code that returns the user's Spotify username */
      let accessToken = accessToken;
      let headers = {
        Authorization: 'Bearer ' + accessToken
      };
      let userId = '';
      return fetch('https://api.spotify.com/v1/me', {headers: headers}).then(response => {
        return response.json();
      }).then(jsonResponse => {
        userId = jsonResponse.id;
      });
      /* End of code that returns the user's Spotify username */

      /* Code that creates a new playlist */
      let urlCreatePlaylist = `https://api.spotify.com/v1/users/${userId}/playlists`;
      let dataCreatePlaylist = {name: playlistName, public: false};
      let playlistId = '';
      return fetch(urlCreatePlaylist, {
        method: 'POST',
        body: JSON.stringify(dataCreatePlaylist),
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        }
      }).then(response => {
        return response.json();
      }).catch(error => console.log('Create playlist error: ', error))
      .then(jsonResponse => {
        playlistId = jsonResponse.id;
      });
      /* End of code that creates new playlist */

      /* Code that adds tracks to the user's playlist */
      let urlAddTracks = `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`;
      let dataAddTracks = {uris: [trackURIs]};
      fetch(urlAddTracks, {
        method: 'POST',
        body: JSON.stringify(dataAddTracks),
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        }
      }).then(response => {
        return response.json();
      }).catch(error => console.log('Add tracks error: ', error))
      .then(jsonResponse => {
        let snapshotId = jsonResponse.snapshot_id;
      });
      /* End of code that adds tracks to the user's playlist */

    }
  }
};

export default Spotify;
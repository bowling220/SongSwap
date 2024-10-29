# 🎵 SongSwap

SongSwap is an interactive music discovery game that combines your Spotify listening experience with gamification elements. Collect songs, trade with others, and discover new music in an engaging way.

## 🌟 Features

- **Spotify Integration**: Seamlessly connect with your Spotify account
- **Song Collection**: Discover and collect songs in an interactive map interface
- **Rarity System**: Songs have different rarity levels (Common, Rare, Epic)
- **Virtual Currency**: Earn coins and gems through gameplay
- **Song Auction**: Bid on and trade songs with other players
- **Real-time Playback**: Control your Spotify playback directly in the app

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Expo CLI
- Spotify Developer Account
- Spotify Premium Account (for playback features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/songswap.git
cd songswap
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Spotify credentials:
```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

4. Start the development server:
```bash
npx expo start
```

## 🛠️ Built With

- [React Native](https://reactnative.dev/) - Mobile app framework
- [Expo](https://expo.dev/) - Development platform
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) - Music streaming integration
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - Local data persistence
- [Expo Router](https://expo.github.io/router/docs/) - Navigation

## 📱 Supported Platforms

- iOS
- Android
- Web (Beta)

## 🎮 How to Play

1. Log in with your Spotify account
2. Explore the map to find song encounters
3. Collect songs by tapping on them
4. Build your collection and trade with others
5. Earn currency through various activities
6. Bid on rare songs in the auction house

## 🔐 Authentication

SongSwap uses Spotify OAuth2 for authentication. The app requires the following Spotify permissions:
- user-read-email
- playlist-read-private
- user-library-read
- user-read-private
- user-top-read
- user-read-recently-played
- user-modify-playback-state
- user-read-playback-state

## 🎨 Design

The app features a modern, intuitive interface with:
- Dark mode support
- Interactive map interface
- Smooth animations
- Responsive design
- Cross-platform consistency

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## 👥 Authors

- **Blaine Oler** - *Initial work* - [Github](https://github.com/Bowling220)

## 🙏 Acknowledgments

- Spotify for their excellent Web API
- The React Native community
- All contributors and testers

## 📞 Support

For support, email olerblaine@gmail.com or join our Discord server.

---

Made with ❤️ by [Blaine Oler]

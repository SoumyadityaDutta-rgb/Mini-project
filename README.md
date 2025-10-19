# Music-Platform

A full-stack social music and audiobook platform enabling users to upload, stream, and share audio content, manage friends, and interact in real time.

## Features

- User authentication with JWT
- Friend system: search, send/accept/decline requests, friend list (supports 1,000+ users)
- Upload and stream songs/audiobooks (Cloudinary integration, 10,000+ files supported)
- Recommendations and playlist sharing
- Real-time presence and notifications (Socket.IO, 100+ concurrent users)
- Modular React frontend with responsive design
- RESTful API with 50+ endpoints
- Secure, scalable Node/Express/MongoDB backend

## Project Structure

```
Music-Platform-main/
  my-app/                # React frontend
    src/
      components/
      contexts/
      utils/
      ...
  spotify_backend/       # Node/Express backend
    models/
    routes/
    ...
```





## Key API Endpoints

- `POST /auth/login` — User login
- `POST /auth/signup` — User registration
- `GET /friends/search/:query` — Search users
- `POST /friends/request` — Send friend request
- `POST /friends/request/:requestId/accept` — Accept request
- `POST /friends/request/:requestId/decline` — Decline request
- `GET /friends/list` — List friends
- `GET /friends/requests` — Pending requests
- `POST /friends/recommend` — Recommend song
- `POST /friends/share-playlist` — Share playlist

## Real-Time Events (Socket.IO)

- `privateMessage` — Send message
- `friendOnline` / `friendOffline` — Presence updates
- `friendCurrentlyPlaying` — Now playing updates
- `newMessage` — Receive message
- `messageSent` — Message confirmation

## Testing

- Use Postman or curl to test API endpoints.
- Use two browser sessions to test friend requests and real-time presence.

## Contribution

- Fork the repo and submit pull requests.
- Follow existing code style and structure.
- Add tests for new features.

## License

MIT

---


For questions or support, contact [Soumyaditya Dutta] at [soumyadityadutta40@gmail.com].

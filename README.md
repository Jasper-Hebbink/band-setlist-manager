<<<<<<< HEAD
# Band Setlist Manager

Een privaat lokaal leerproject voor het beheren van coverbandnummers, repetitiestatus en setlists.

## Projectstructuur

- `src/app` bevat de Next.js App Router-pagina's.
- `src/app/songs` bevat de nummerslijst, aanmaken, details en song serveractions.
- `src/app/setlists` bevat de setlistlijst, aanmaken, details en setlist serveractions.
- `src/lib` bevat kleine gedeelde hulpprogramma's voor Prisma, formulieren, statussen en duurformattering.
- `src/lib/spotify` is een placeholder voor de toekomstige Spotify Web API-integratie.
- `prisma/schema.prisma` definieert de SQLite-databasemodellen.

## Lokale installatie en starten

1. Installeer dependencies:

```bash
npm install
```

2. Maak de lokale SQLite-database en de eerste migratie aan:

```bash
npx prisma migrate dev --name init
```

3. Start de development-server:

```bash
npm run dev
```

4. Open deze URL in je browser:

```text
http://localhost:3000
```

> Zorg dat je Node.js en npm geïnstalleerd hebt voordat je begint.

## Handige Prisma-commando's

Regenerateer de Prisma-client nadat je schemawijzigingen hebt doorgevoerd:

```bash
npx prisma generate
```

Open Prisma Studio om lokale data te bekijken en te bewerken:

```bash
npx prisma studio
```

## Spotify playlist import

Zet de volgende waarden in een `.env`-bestand:

```bash
SPOTIFY_CLIENT_ID="your_client_id"
SPOTIFY_CLIENT_SECRET="your_client_secret"
SPOTIFY_REDIRECT_URI="http://127.0.0.1:3000/api/spotify/callback"
```

Voeg dezelfde redirect URI toe in de instellingen van je Spotify Developer Dashboard-app. Gebruik dan `/songs/import-playlist`, verbind met Spotify en plak een playlist-URL of playlist-ID.

## Liedtoonsoort zoeken

Zet dit in `.env` als je wilt dat de knop `Find key` op de songdetailpagina werkt:

```bash
GETSONGBPM_API_KEY="your_getsongbpm_api_key"
```

De toonsoort-zoekfunctie gebruikt metadata in de stijl van GetSongBPM/GetSongKEY. Als er geen match wordt gevonden, blijft de huidige toonsoort behouden.

## PDF-notities

PDF-notities worden geüpload vanaf elke songdetailpagina. Geüploade bestanden worden lokaal opgeslagen onder:

```text
public/uploads/song-documents
```

Die map wordt door Git genegeerd omdat dit jouw privé oefenbestanden zijn.

## Volgende kleine stap

Voeg bewerkingsformulieren toe voor nummers en setlists. Dat is de meest nuttige vervolgstap voordat je Spotify-zoek-/importfunctionaliteit toevoegt.


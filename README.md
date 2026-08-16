# Israel Geography

Hebrew web game for learning city locations in Israel. This is a static
React/Vite app served by the private Raspberry Pi server at `/geography/`; it
does not need a backend, database, or `systemd` service.

## First local run

```powershell
cd pi-geography
npm install
npm run dev:lan
```

## Later local runs

```powershell
cd pi-geography
npm run dev:lan
```

Open <http://localhost:5173/geography/> on the computer. On a phone connected
to the same Wi-Fi, open `http://<computer-ip>:5173/geography/`. Find the
computer IP with `ipconfig` and allow Node through Windows Firewall on private
networks if prompted.

The app is an installable PWA. Its service worker and cached files are scoped
to `/geography/`, so they cannot intercept the other Pi apps.

## First Pi setup

After the GitHub Action below has created a green `deploy` branch:

```bash
sudo useradd --system --user-group --home-dir /opt/pi-geography --shell /usr/sbin/nologin pi-geography
sudo install -d -o pi-geography -g pi-geography /opt/pi-geography
sudo -u pi-geography git clone --branch deploy https://github.com/Evyats/pi-geography.git /opt/pi-geography/app
sudo /opt/pi-geography/app/deploy.sh
sudo /opt/pi-home/app/deploy.sh
```

The final command publishes Pi Home's shared Nginx route for `/geography/`.

## Deploy updates

Push changes to `main`, then check [GitHub Actions](https://github.com/Evyats/pi-geography/actions).
Wait for **Build deploy branch** to turn green, then run on the Pi:

```bash
sudo /opt/pi-geography/app/deploy.sh
```

## Geography data

Runtime data lives under `public/data/`. To change difficulty segments, edit
`difficulty_segments_by_name.json` using exact Hebrew names from
`cities_catalog.json`.

## Screenshots

|  |  |
|---|---|
| ![Screenshot 1](screenshots/1.png) | ![Screenshot 2](screenshots/2.png) |
| ![Screenshot 3](screenshots/3.png) | ![Screenshot 4](screenshots/4.png) |
| ![Screenshot 5](screenshots/5.png) | ![Screenshot 6](screenshots/6.png) |

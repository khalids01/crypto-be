/\*\*

- 📘 Binance Kline (Candlestick) API Documentation
-
- 🔗 Endpoint:
- GET https://api.binance.com/api/v3/klines
-
- 📌 Purpose:
- Fetch historical candlestick data for a specific trading pair (e.g., BTCUSDT).
- Useful for plotting charts, monitoring trends, and analyzing price movements.
-
- 🧾 Query Parameters:
- - symbol: string → Trading pair symbol (e.g., BTCUSDT)
- - interval: string → Time interval (e.g., 1m, 5m, 1h, 1d)
- - limit: number → Number of candles to return (max 1000, default 500)
- - interval=1m and limit=10 means data of last 10 minutes
-
- 🧠 Example:
- GET /api/v3/klines?symbol=BTCUSDT&interval=1m&limit=2
-
- ✅ Response Format:
- An array of candlestick arrays. Each item contains:
- [
- 0: Open time (timestamp in ms),
- 1: Open price (string),
- 2: High price (string),
- 3: Low price (string),
- 4: Close price (string),
- 5: Volume (string, in BTC),
- 6: Close time (timestamp in ms),
- 7: Quote asset volume (USDT traded),
- 8: Number of trades (integer),
- 9: Taker buy base asset volume (BTC),
- 10: Taker buy quote asset volume (USDT),
- 11: Ignore (always "0")
- ]
-
- ✅ Example Response (limit=2):
- [
- [
-     1751977260000,
-     "108712.55",
-     "108712.55",
-     "108688.82",
-     "108695.99",
-     "3.62978",
-     1751977319999,
-     "394554.416765",
-     733,
-     "0.96509",
-     "104900.64106470",
-     "0"
- ],
- ...
- ]
-
- 💡 Notes:
- - Use this data for plotting candlestick charts or line graphs.
- - Convert timestamps to human-readable dates using `new Date(timestamp)`.
- - Parse prices and volumes with `parseFloat()` for calculations.
- - This endpoint is public and does not require authentication.
    \*/

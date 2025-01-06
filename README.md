
#Välkommen till Movie Space

Se information om bilder, sök och filtrera efter genres för att hitta vad du vill se ikväll.
Det går även att spara filmer till favoriter för att se dina favoriter i localstorage ;)
Det är en simpel applikation som kan visa information om filmer från TMDB Api.

#Figma Dev Länk
https://www.figma.com/design/H4Owu2uuUfxBhe9IK0UUfI/Movie-Space?node-id=0-1&m=dev&t=ESi28ua01P3fYZ0d-1 

#Funktioner
- **Sök funktion** - Anvädare kan söka efter filmtitlar
- **Film detaljer** - När användare klickar på en film kan de se informativ beskrivning, som:
  - Titel
  - År
  - Genre
  - Kort beskrivning
  - Poster bild
  - Lägga till i favoriter
- **Se populära filmer** - Användaren får se 20 populära filmer när de kommer in på sidan, användaren kan filtera efter genres.
- **Spara favoriter** - Användaren kan se och spara sina favoriter, det sparas i LocalStorage så finns kvar när användaren uppdaterar sidan.
- **Ta bort favoriter** - Användaren kan även ta bort alla sina favoriter eller bara en film.

## Installation
För att köra projektet lokalt, följ dessa steg:

1. Clone repository, rekommenderas inuti Visual Studio Code.
   ```
   git clone https://github.com/bugstile/MovieSpace.git
   ```

2. Navigera till projekt mappen och öppna mappen i Visual Studio Code, detta händer naturligt om terminalen öppnas i Visual Studio Code.

3. Klicka nere till högra hörnet på Go Live med extension Live Server, detta verktyget kan saknas på din dator, finns i Visual Studio Code Extensions att ladda ner.

## Användning

1. Skriv in en filmtitel i input fältet för att söka efter film.
2. Scrolla ner och välj filmer att se, kan filtreras efter genrer.
3. Lägg till filmer till favoriter, länk till favoritsidan finns längst ner.


# Kortfattad förklaring av hur jag uppfyllt JSON-, HTTP/HTTPS-, asynkronitets- och UX/UI-kraven.

- Jag använder async och await för fetch, API länken är https alltid, data laddas in dynamiskt på hemsidan.
- UX/UI-kraven uppfyller jag med rätt bra öga för design.

# Beskriv hur jag hämtar data från API:et (Vilket API? URL/enpoint, parametrar, API nyckel?).

- Jag har valt att använda https://developer.themoviedb.org/ som mitt API, jag använder en API nyckel som krävde registrering på sidan. 
- För enkel tillgänglighet är det temporärt med i projektet, nyckeln kommer försvinna från min GitHub i framtiden.
- Headers är t.ex:
```js
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
```
```js
const apiUrl = `https://api.themoviedb.org/3/genre/movie/list`;
const apiUrl = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc${genreQuery}`;
const apiUrl = `https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=${searchPage}&query=${encodeURIComponent(title)}`;
```




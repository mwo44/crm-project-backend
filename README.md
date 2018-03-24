# CRM Backend

## Instalacja zależności
```
npm install
```

## Uruchomienie serwera w środowisku lokalnym na domyślnym porcie
```
npm start
```

## Komunikacja z API z lokalnej aplikacji webowej

Zapytania z lokalnej aplikacji powinny być kierowane na adres
```
http://localhost:8081
```

## Zmiana portu
Aby zmienić port należy przed uruchomieniem ustawić zmienną środowiskową o nazwie `PORT`:
```
PORT=1234 npm start
```
Należy pamiętać aby odpytywać API na wybranym porcie z poziomu aplikacji webowej:
```
http://localhost:1234
```

## Monitorowanie zapytań
Aplikacja po uruchomieniu zapisuje logi w pliku `access.log` w głównym katalogu aplikacji.
Aby monitorować logi w czasie rzeczywistym można posłużyć się komendą `tail`:
```
tail -f access.log
```

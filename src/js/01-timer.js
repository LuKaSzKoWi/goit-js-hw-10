import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

const startBtn = document.querySelector('[data-start]');
const daysEl = document.querySelector('[data-days]');
const hoursEl = document.querySelector('[data-hours]');
const minutesEl = document.querySelector('[data-minutes]');
const secondsEl = document.querySelector('[data-seconds]');
let userSelectedDate = null; // Zmienna przechowująca wybraną datę
let timerInterval = null; // Zmienna do przechowywania identyfikatora interwału
let isTimerRunning = false; // Flaga do sprawdzania, czy timer już działa

// Konfiguracja flatpickr
const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
    userSelectedDate = selectedDates[0];
    // Sprawdzamy, czy wybrana data jest w przyszłości
    if (userSelectedDate < new Date()) {
      iziToast.error({
        title: 'Error',
        message: 'Please choose a date in the future',
      });
      startBtn.disabled = true;
    } else {
      startBtn.disabled = isTimerRunning; // Aktywujemy przycisk "Start" tylko, jeśli timer nie działa
    }
  },
};

// Inicjalizacja flatpickr na polu input
flatpickr("#datetime-picker", options);

// Obsługa kliknięcia przycisku "Start"
startBtn.addEventListener("click", () => {
  if (isTimerRunning) return; // Jeśli timer już działa, nie rób nic

  if (timerInterval) {
    clearInterval(timerInterval); // Jeśli timer już działa, zatrzymaj go
  }

  isTimerRunning = true; // Ustaw flagę, że timer jest uruchomiony
  startBtn.disabled = true; // Dezaktywujemy przycisk po starcie
  timerInterval = setInterval(() => {
    const currentTime = new Date();
    const timeLeft = userSelectedDate - currentTime; // Obliczamy pozostały czas

    if (timeLeft <= 0) {
      clearInterval(timerInterval); // Zatrzymujemy timer, gdy dojdzie do końca
      iziToast.success({
        title: 'Success',
        message: 'Countdown finished!',
      });
      updateTimerUI(0); // Resetujemy licznik
      isTimerRunning = false; // Resetujemy flagę po zakończeniu
      return;
    }

    const time = convertMs(timeLeft);
    updateTimerUI(time); // Aktualizujemy interfejs użytkownika
  }, 1000);
});

// Funkcja przeliczająca milisekundy na dni, godziny, minuty i sekundy
function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}

// Funkcja aktualizująca interfejs licznika
function updateTimerUI({ days, hours, minutes, seconds }) {
  daysEl.textContent = addLeadingZero(days);
  hoursEl.textContent = addLeadingZero(hours);
  minutesEl.textContent = addLeadingZero(minutes);
  secondsEl.textContent = addLeadingZero(seconds);
}

// Funkcja dodająca wiodące zero, jeśli liczba ma mniej niż dwa znaki
function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

// Użytkownik wybiera datę za pomocą flatpickr.
// Jeśli data jest w przeszłości, wyświetli się powiadomienie o błędzie za pomocą iziToast, a przycisk „Start” pozostanie nieaktywny.
// Po wybraniu daty w przyszłości, użytkownik może uruchomić licznik.
// Licznik aktualizuje dni, godziny, minuty i sekundy co sekundę.
// Gdy czas się skończy, timer zatrzymuje się i wyświetla powiadomienie o sukcesie.
import API from './fetchApi';
import movieTmpl from '../templates/movie-card.hbs';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { getMoviesFromDB } from './database';
import {
  gallery,
  signInForm,
  registrationForm,
  queuedBtn,
  watchedBtn,
  homeBtn,
  signOutBtn,
  myLibraryBtn,
  modalSignInClose,
  goToRegistrationBtn,
  modalRegistrationOpen,
  modalRegistrationClose,
} from './refs';
import {
  successfulRegistrationMsg,
  authErrorMsg,
  signOutMsg,
  successfulSignInMsg,
  registrationErrorMsg,
  errorMsg,
} from './pontify';
import {
  markupMyLibrary,
  markupHome,
  onLibraryBtnClick,
  addBtnQueueAccentColor,
  addBtnWatchedAccentColor,
} from './header';
import {
  closeRegistrationModal,
  openSignInModal,
  openRegistrationModal,
  closeSignInModal,
} from './modalAuth';

const api = new API();
// const database = getDatabase();
const auth = getAuth();
handleAuthStateChange();

//user registration function
async function handleRegistration(e) {
  e.preventDefault();
  markupMyLibrary();
  const email = e.currentTarget.elements.email.value;
  const password = e.currentTarget.elements.password.value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    successfulRegistrationMsg();
    closeRegistrationModal();
  } catch (error) {
    const errorCode = error.code;
    registrationErrorMsg(errorCode.slice(5).replace(/-/g, ' '));
  }
}

async function handleSignIn(e) {
  e.preventDefault();
  markupMyLibrary();
  const email = e.currentTarget.elements.email.value;
  const password = e.currentTarget.elements.password.value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    successfulSignInMsg();
    closeSignInModal();
  } catch {
    authErrorMsg();
  }
}

async function handleSignOut() {
  try {
    await signOut(auth, user => {
      const userId = user.uid;
      myLibraryBtn.removeEventListener('click', e => getMoviesFromDB(userId, 'watchedMovies'));
      watchedBtn.removeEventListener('click', e => {
        getMoviesFromDB(userId, 'watchedMovies');
      });
      queuedBtn.removeEventListener('click', e => {
        getMoviesFromDB(userId, 'queuedMovies');
      });
    });
    signOutMsg();
  } catch {
    errorMsg();
  }
}

async function handleAuthStateChange() {
  try {
    onAuthStateChanged(auth, user => {
      if (user) {
        const userId = user.uid;
        addBtnWatchedAccentColor();
        myLibraryBtn.addEventListener('click', e => getMoviesFromDB(userId, 'watchedMovies'));
        watchedBtn.addEventListener('click', e => {
          getMoviesFromDB(userId, 'watchedMovies');
        });
        queuedBtn.addEventListener('click', e => {
          getMoviesFromDB(userId, 'queuedMovies');
        });
        manageLogInEvents();
      } else {
        goToHomePage();
        manageLogOutEvents();
      }
    });
  } catch {
    errorMsg();
  }
}

//functions for managing event listeners as user  is logged in and logged out
function manageLogInEvents() {
  myLibraryBtn.addEventListener('click', onLibraryBtnClick);
  homeBtn.addEventListener('click', goToHomePage);
  signInForm.removeEventListener('submit', handleSignIn);
  myLibraryBtn.removeEventListener('click', openSignInModal);
  registrationForm.removeEventListener('submit', handleRegistration);
  modalSignInClose.removeEventListener('click', closeSignInModal);
  modalRegistrationOpen.removeEventListener('click', openRegistrationModal);
  modalRegistrationClose.removeEventListener('click', closeRegistrationModal);
  goToRegistrationBtn.removeEventListener('click', openRegistrationModal);
  // signOutBtn.addEventListener('click', handleSignOut);
}

function manageLogOutEvents() {
  myLibraryBtn.removeEventListener('click', onLibraryBtnClick);
  homeBtn.removeEventListener('click', goToHomePage);
  registrationForm.addEventListener('submit', handleRegistration);
  signInForm.addEventListener('submit', handleSignIn);
  // signOutBtn.removeEventListener('click', handleSignOut);
  myLibraryBtn.addEventListener('click', openSignInModal);
  modalSignInClose.addEventListener('click', closeSignInModal);
  modalRegistrationOpen.addEventListener('click', openRegistrationModal);
  modalRegistrationClose.addEventListener('click', closeRegistrationModal);
  goToRegistrationBtn.addEventListener('click', openRegistrationModal);
}

function renderMovieCard(movie) {
  gallery.innerHTML = movieTmpl(movie);
}

async function goToHomePage() {
  markupHome();
  try {
    const data = await api.fetchMovie();
    const movie = renderMovieCard(data);
  } catch {
    errorMsg();
  }
}

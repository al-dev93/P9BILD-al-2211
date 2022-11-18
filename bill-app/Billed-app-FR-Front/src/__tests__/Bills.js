/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { logDOM, prettyDOM, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import { formatDate, formatStatus } from "../app/format.js";
import Bills from "../containers/Bills.js"
import mockedStore from "../__mocks__/store.js"
import { bills } from "../fixtures/bills.js"
import router from "../app/Router.js";

jest.mock("../app/Store.js", () => mockedStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toBeTruthy();
    });

    test("Then bills in store should be displayed", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const formatBills = bills.map((data) => {
        return {
          ...data,
          status: formatStatus(data.status)
        }
      })
      const emulatedBills = await new Bills({
        document, onNavigate, store: mockedStore, localStorage: window.localStorage
      })
        .getBills();
      await waitFor(() => expect(emulatedBills).toEqual(formatBills));
    });

    test("Then bills should be ordered from earliest to latest", () => {
      //COMMENT injection des données mockées dans le DOM
      document.body.innerHTML = BillsUI({ data: bills });
      //COMMENT sélection des dates dans le DOM par le test-id
      const dates = screen.getAllByTestId('bill-date').map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = bills
                          .map(a => a.date)         //COMMENT création d'un tableau de dates avec les données mockées
                          .sort(antiChrono)         //COMMENT tri du tableau du plus récent au plus ancien
                          .map(a => formatDate(a));  //COMMENT mise au format date identique à celui du DOM
      expect(dates).toEqual(datesSorted);
    })
  })
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills page and I click on the eye icon", () => {
    test("Then callback handleClickIconEye should be called and a modale should be open", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const emulatedBills = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      });

      const handleClickIconEye = jest.fn(emulatedBills.handleClickIconEye);
      const iconEye = screen.getAllByTestId('icon-eye');
      iconEye.forEach(icon =>{
        icon.addEventListener('click', handleClickIconEye(icon));
        userEvent.click(icon);
        expect(handleClickIconEye).toHaveBeenCalled();

        const modale = screen.getByText('Justificatif');
        expect(modale).toBeTruthy();
      })
    })
  });

  describe("When I am on Bills page and the handleClickNewBill method is called", () => {
    test("Then the New Bill page should be displayed", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      await router();
      window.onNavigate(ROUTES_PATH.Bills);

      new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
        .handleClickNewBill();

      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();
    })
  })
});

//COMMENT: test d'intégration GET Bills
describe("Given I am a user connected as employee", () =>{
  describe("When I navigate to bills page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: 'Employee', email: 'a@a'}));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const expenseType1 = screen.getByText("Hôtel et logement");
      expect(expenseType1).toBeTruthy();
      const expenseType2 = screen.getByText("Transports");
      expect(expenseType2).toBeTruthy();
      const expenseType3 = screen.getByText("Services en ligne");
      expect(expenseType3).toBeTruthy();
      const expenseType4 = screen.getByText("Restaurants et bars");
      expect(expenseType4).toBeTruthy();
    })
  });
  
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockedStore, "bills");
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      );
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    })

    test("fetches bills from an API and fails with 404 message error", async () => {
      mockedStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      //const dates = screen.getAllByText(/^(20[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|(1|2)[0-9]|3[0-1]))$/g)

      const message = screen.getByText(/Erreur 404/);
      expect (message).toBeTruthy();
    });

    test("fetches bills from an API and fails with 500 message error", async () => {
      mockedStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      //const dates = screen.getAllByText(/^(20[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|(1|2)[0-9]|3[0-1]))$/g)

      const message = screen.getByText(/Erreur 500/);
      expect (message).toBeTruthy();
    })
  });
})
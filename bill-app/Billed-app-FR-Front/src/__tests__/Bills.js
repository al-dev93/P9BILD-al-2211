/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import { formatDate } from "../app/format.js";
import Bills from "../containers/Bills.js"
import mockedStore from "../__mocks__/store.js"
import { bills } from "../fixtures/bills.js"
import router from "../app/Router.js";

jest.mock("../app/Store.js", () => mockedStore)

describe("Given I am connected as an employee", () => {
  
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {
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

    test("Then bills should be ordered from earliest to latest", async () => {
      const emulatedBills = await new Bills({
        document, onNavigate, store: mockedStore, localStorage
      }).getBills();

      document.body.innerHTML = BillsUI({ data: emulatedBills });

      const displayedDate = screen.getAllByTestId('bill-date').map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a.date < b.date) ? 1 : -1);
      const mockedSortDate = bills.sort(antiChrono).map(a => formatDate(a.date));

      expect(displayedDate).toStrictEqual(mockedSortDate);
    })
  });

  describe("When I am on Bills page and I click on the eye icon", () => {
    test("Then callback handleClickIconEye should be called and a modale should be open", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      
      const emulatedBills = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      });

      const iconEye = screen.getAllByTestId('icon-eye');
      
      const handleClickIconEye = jest.fn(emulatedBills.handleClickIconEye);
      iconEye.forEach(icon =>{
        icon.addEventListener('click', handleClickIconEye(icon));
        userEvent.click(icon);
        expect(handleClickIconEye).toHaveBeenCalled();

        const modale = screen.getByText('Justificatif');
        expect(modale).toBeTruthy();
      })
    })
  });

  describe("When I am on Bills page and I click on new bill button", () => {
    test("Then the New Bill page should be displayed", () => {      
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
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

    test("fetches bills from an API and send a message in console if data is corrupted", async () => {
      console.log = jest.fn();
      mockedStore.bills.mockImplementationOnce(() => {
        return {
          list: jest.fn().mockResolvedValue([{}])
        }
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);

      expect(`${console.log.mock.calls[0][0]}`).toEqual('RangeError: Invalid time value')
    });

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

      const message = screen.getByText(/Erreur 500/);
      expect (message).toBeTruthy();
    })
  });
})
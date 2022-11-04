/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import { formatDate } from "../app/format.js";
import router from "../app/Router.js";

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

    })
    test("Then bills should be ordered from earliest to latest", () => {
      //COMMENT injection des données mockées dans le DOM
      document.body.innerHTML = BillsUI({ data: bills })
      //COMMENT sélection des dates dans le DOM par le test-id
      const dates = screen.getAllByTestId('bill-date').map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = bills
                          .map(a => a.date)         //COMMENT création d'un tableau de dates avec les données mockées
                          .sort(antiChrono)         //COMMENT tri du tableau du plus récent au plus ancien
                          .map(a => formatDate(a))  //COMMENT mise au format date identique à celui du DOM
      expect(dates).toEqual(datesSorted)
    })
  })
})

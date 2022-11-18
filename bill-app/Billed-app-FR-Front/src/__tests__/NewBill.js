/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill   from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock }    from "../__mocks__/localStorage.js"
import { bills }   from "../fixtures/bills.js"
import mockedStore from "../__mocks__/store.js"
import router      from "../app/Router.js"

jest.mock("../app/Store.js", () => mockedStore)

describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {
    test("Then the NewBill form should be displayed", async () => {
      localStorage.setItem("user", JSON.stringify({ type: 'Employee', email: 'a@a'}));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      
      await waitFor(() => screen.getByText("Envoyer une note de frais"));
      const formData = screen.getAllByTestId("form-new-bill");
      
      expect(formData).toBeTruthy();
    })
  });

  describe("When I am on NewBill Page and filing in the fields to submit the form", () => {
    let billForm, expenseTypeInput, datePickerInput, amountInput,
        pctInput, fileInput, fileInputLabel, file, billData;

    beforeAll(() => {
      billData = bills[0];
      file = new File(['test'], billData.fileName, {type: 'image/jpeg'});
    });

    beforeEach(() => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      
      billForm         = screen.getByTestId("form-new-bill");
      expenseTypeInput = screen.getByTestId("expense-type");
      datePickerInput  = screen.getByTestId("datepicker");
      amountInput      = screen.getByTestId("amount");
      pctInput         = screen.getByTestId("pct");
      fileInput        = screen.getByTestId("file");
      fileInputLabel   = screen.getByLabelText(/Justificatif/i)
    });

    afterEach (() => {
      document.body.innerHTML = "";
    });

    test("Then an error should be displayed when form fields are empty", () => {
      expect(expenseTypeInput).toBeValid();
      expect(datePickerInput).not.toBeValid();
      expect(amountInput).not.toBeValid();
      expect(pctInput).not.toBeValid();
      expect(fileInput.files[0]).toBeFalsy();
    });

    test("Then an error should be displayed when date is empty", () => {      
      fireEvent.change(amountInput, { target: { value: billData.amount } });
      fireEvent.change(pctInput, { target: { value: billData.pct } });
      userEvent.upload(fileInputLabel, file); 

      expect(expenseTypeInput).toBeValid();
      expect(datePickerInput).not.toBeValid();
      expect(amountInput).toBeValid();
      expect(pctInput).toBeValid();
      expect(fileInput.files[0]).toBeTruthy();
    });

    test("Then an error should be displayed when amount is empty", () => {
      fireEvent.change(expenseTypeInput, { target: { value: billData.type } });
      fireEvent.change(datePickerInput, { target: { value: billData.date } });
      fireEvent.change(pctInput, { target: { value: billData.pct } });
      userEvent.upload(fileInputLabel, file); 

      expect(expenseTypeInput).toBeValid();
      expect(datePickerInput).toBeValid();
      expect(amountInput).not.toBeValid();
      expect(pctInput).toBeValid();
      expect(fileInput.files[0]).toBeTruthy();
    });

    test("Then an error should be displayed when pct is empty", () => {
      fireEvent.change(expenseTypeInput, { target: { value: billData.type } });
      fireEvent.change(datePickerInput, { target: { value: billData.date } });
      fireEvent.change(amountInput, { target: { value: billData.amount } });
      userEvent.upload(fileInputLabel, file); 

      expect(expenseTypeInput).toBeValid();
      expect(datePickerInput).toBeValid();
      expect(amountInput).toBeValid();
      expect(pctInput).not.toBeValid();
      expect(fileInput.files[0]).toBeTruthy();
    });

    test("Then an error should be displayed when file is empty", () => {
      fireEvent.change(expenseTypeInput, { target: { value: billData.type } });
      fireEvent.change(datePickerInput, { target: { value: billData.date } });
      fireEvent.change(amountInput, { target: { value: billData.amount } });
      fireEvent.change(pctInput, { target: { value: billData.pct } });

      expect(expenseTypeInput).toBeValid();
      expect(datePickerInput).toBeValid();
      expect(amountInput).toBeValid();
      expect(pctInput).toBeValid();
      expect(fileInput.files[0]).toBeFalsy();
    });

    test("Then no error should be displayed so all required fields are completed", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const emulatedNewBill = new NewBill({
        document, onNavigate, store: mockedStore, localStorage
      });
      billForm.addEventListener("submit", emulatedNewBill.handleSubmit);

      fireEvent.change(expenseTypeInput, { target: { value: billData.type } });
      fireEvent.change(datePickerInput, { target: { value: billData.date } });
      fireEvent.change(amountInput, { target: { value: billData.amount } });
      fireEvent.change(pctInput, { target: { value: billData.pct } });
      userEvent.upload(fileInputLabel, file); 
      
      expect(expenseTypeInput).toBeValid();
      expect(datePickerInput).toBeValid();
      expect(amountInput).toBeValid();
      expect(pctInput).toBeValid();
      expect(fileInput.files[0]).toBeTruthy();
      
      fireEvent.submit(billForm);
      
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    })
  })
});

//COMMENT: test d'intégration POST NewBill
describe("Given I am a user connected as employee", () => {
  let fileInput, onNavigate, emulatedNewBill ;
  
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
    const html = NewBillUI();
    document.body.innerHTML = html;
    onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    fileInput = screen.getByTestId("file");

    emulatedNewBill = new NewBill({
      document, onNavigate, store: mockedStore, localStorage
    });
    fileInput.addEventListener('change', emulatedNewBill.handleChangeFile);
  });

  afterEach (() => {
    document.body.innerHTML = "";
    jest.restoreAllMocks();
  });

  describe("When I navigate to NewBill page", () => {

    test('Then the bill should not be POST on API if the proof file is not an image', async () => {
      const file = new File(['test'], 'test.pdf', {type: 'application/pdf'});
      userEvent.upload(fileInput, file, {applyAccept: false});

      await waitFor(() => expect(emulatedNewBill.fileUrl).toBeNull());
      await waitFor(() => expect(emulatedNewBill.billId).toBeNull());
    });

    test('Then the bill should be POST on API if the proof file is an image', async () => {
      const file = new File(['test'], 'https://localhost:3456/images/test.jpg', {type: 'image/jpeg'});
      userEvent.upload(fileInput, file);
      
      await waitFor(() => expect(emulatedNewBill.fileUrl).toBe('https://localhost:3456/images/test.jpg'));
      await waitFor(() => expect(emulatedNewBill.billId).toBe('1234'));
    })
  });

  describe("When an error occurs on API", () => {
    let consoleSpy, file;

    beforeEach(() => {
      consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      file = new File(['test'], 'https://localhost:3456/images/test.jpg', {type: 'image/jpeg'});
    });

    test('POST bills on API and fails with 500 message error', async () => {
      mockedStore.bills.mockImplementationOnce(() => {
        return {
          create: jest.fn().mockRejectedValue(new Error("Erreur 500"))
        }
      });
      userEvent.upload(fileInput, file);
      await new Promise(process.nextTick);
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0]);
    })
  })
})

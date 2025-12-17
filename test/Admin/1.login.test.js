const { Builder, Browser, By, XS, Key, until } = require('selenium-webdriver');
let driver;
describe('Login in aplication ADCU', function () {


    beforeEach(async function () {
        // driver = await new Builder().forBrowser('chrome').build();
    });

    afterEach(async function () {
        // await driver.quit();
    });

    it('Abrir Navegador', async function () {
        try {
            driver = await new Builder().forBrowser(Browser.EDGE).build();
             await driver.get('https://adcu.giize.com/login');

        } catch (e) {
            console.log(e)
        }

    })


    it('Login con correo mal ', async function () {
        try {
            await driver.manage().window().maximize();

            const emailInput = await driver.wait(until.elementLocated(By.id('formBasicEmail')), 5000);
            const passwordInput = await driver.wait(until.elementLocated(By.id('formBasicPassword')), 5000);
            const clickButton = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/div/div[2]/form/button')), 5000);
            if (!emailInput || !passwordInput || !clickButton) throw new Error('No se encuentra el input email o contraseña o el boton');

            // await driver.wait(until.elementIsVisible(emailInput),5000);

            await emailInput.sendKeys('adminn@example.com');

            await passwordInput.sendKeys('CarlosAdmin2024');

            await clickButton.click();
            await emailInput.sendKeys('adminn@example.com');

            // await driver.sleep(2000);

            await driver.wait(until.elementsLocated(By.xpath('//*[@id="root"]/section/ol/li/div[2]/div[2]')), 2000)


        } catch (e) {
            console.log(e)
        }


    });

    it('Login con contraseña mal', async function () {
        try {
            const emailInput = await driver.wait(until.elementLocated(By.id('formBasicEmail')), 5000);
            const passwordInput = await driver.wait(until.elementLocated(By.id('formBasicPassword')), 5000);
            const clickButton = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/div/div[2]/form/button')), 5000);
            if (!emailInput || !passwordInput || !clickButton) throw new Error('No se encuentra el input email o contraseña o el boton');

            //Limpiar inputs
            await emailInput.clear();

            await emailInput.sendKeys('admin@example.com');

            await passwordInput.clear();

            await passwordInput.sendKeys('CarlosAdmin20244');

            await clickButton.click();

            await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/section/ol/li/div[2]/div[2]')));

        } catch (e) {
            console.log(e)

        }


    });

    it('Login correcte in aplication ADCU', async function () {

        try {
            const emailInput = await driver.wait(until.elementLocated(By.id('formBasicEmail')), 5000);
            const passwordInput = await driver.wait(until.elementLocated(By.id('formBasicPassword')), 5000);
            const clickButton = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/div/div[2]/form/button')), 5000);
            if (!emailInput || !passwordInput || !clickButton) throw new Error('No se encuentra el input email o contraseña o el boton');

            // await driver.wait(until.elementIsVisible(emailInput),5000);
            await emailInput.clear();

            await emailInput.sendKeys('admin@example.com');

            await passwordInput.clear();

            await passwordInput.sendKeys('CarlosAdmin2024');



            await clickButton.click();

            // Esperar el mensae
            const alertOk = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/div[2]/div[1]/div/div/h2')), 5000);

            if (!alertOk) throw new Error('No se el Hola Adminitrador')

            await driver.wait(until.elementIsVisible(alertOk), 5000);
        }catch(e){
            console.log(e)
        }

       

    });

    it('Cerrar Navegador', async function () {
        await driver.quit();
    })


});
const { Builder, Browser, By, XS, Key, Select, until } = require('selenium-webdriver');

describe('Prueba',function(){
    let driver;

    beforeEach(async function () {

        
    })


    it('Navegador',async function () {
        driver = await new Builder().forBrowser(Browser.EDGE).build();
        await driver.manage().window().maximize();
        await  driver.get('https://www.google.com');
        
    });

    it('GoogleEscritura',async function () {
        await driver.findElement(By.xpath('//*[@id="APjFqb"]')).sendKeys('Hola')
    })
})
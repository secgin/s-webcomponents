# s-webcomponents

Kapsamlı, bağımsız ve modern JavaScript web bileşenleri koleksiyonu. Select ve MoneyInput gibi sık kullanılan UI elementlerini kolayca projelerine ekleyebilirsin.

## Kurulum

### npm ile
```
npm install s-webcomponents
```
veya
```
yarn add s-webcomponents
```

### CDN ile
```html
<script src="https://cdn.jsdelivr.net/npm/s-webcomponents@1.0.0/dist/s-webcomponents.umd.min.js"></script>
```

## Kullanım

### Select Bileşeni
```html
<s-select name="meyve">
  <s-option value="elma" label="Elma"></s-option>
  <s-option value="armut" label="Armut"></s-option>
  <s-option value="muz" label="Muz" selected></s-option>
</s-select>
```

#### Çoklu Seçim
```html
<s-select name="meyve2" multi-select>
  <s-option value="elma" label="Elma" selected></s-option>
  <s-option value="armut" label="Armut"></s-option>
  <s-option value="muz" label="Muz"></s-option>
</s-select>
```

#### API ile Dinamik Seçenekler
```html
<s-select name="urun" api-url="https://fakestoreapi.com/products" api-config="mySelectConfig"></s-select>
<script>
window.mySelectConfig = {
  paramName: 'q',
  mapper: data => data.map(item => ({ value: item.id, label: item.title })),
  filter: (data, searchValue) => data.filter(item => item.label.toLowerCase().includes(searchValue.toLowerCase()))
};
</script>
```

### MoneyInput Bileşeni
```html
<s-money-input name="tutar" value="1000" currency="TRY"></s-money-input>
```

#### Dövizli Kullanım
```html
<s-money-input name="tutar2" value="1000" currency="TRY" exchange-currency="USD"></s-money-input>
```

## Özellikler
- Tamamen bağımsız, framework gerektirmez
- Shadow DOM ve slot desteği
- Form ile tam entegrasyon
- Klavye ve erişilebilirlik desteği
- Dinamik API ile seçenek yükleme
- Çoklu seçim ve chip desteği
- Para birimi ve döviz desteği

## Lisans
ISC

---
Daha fazla örnek ve dokümantasyon için [demo klasörüne](./demo) göz atabilirsin.


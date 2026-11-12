# Блоки кейсов

Сборщик `scripts/build.py` превращает эти теги в обычный семантический HTML. Используйте их в `src/pages/*.html`.

```html
<case-text id="project-context" title="контекст">
  <p>Текст раздела.</p>
  <case-media src="../assets/img/example.png" alt="Экран продукта" width="1200" height="800">Подпись к экрану</case-media>
</case-text>

<case-callout label="главный вывод">Короткий важный вывод.</case-callout>

<case-media variant="cover" src="../assets/img/cover.png" alt="Обложка" width="1200" height="800"></case-media>
```

`case-text` создаёт раздел с заголовком и областью для текста или другого содержимого. `case-media` создаёт изображение с размерами и необязательной подписью; вариант `cover` использует оформление обложки. `case-callout` выделяет ключевой вывод; вариант `closing` даёт заключительный цвет. Новые варианты добавляйте только при повторяющейся задаче.

/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3007198406")

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "select3141491994",
    "maxSelect": 1,
    "name": "stripeInterval",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "year",
      "month"
    ]
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "bool556524030",
    "name": "cancelAtPeriodEnd",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3007198406")

  // remove field
  collection.fields.removeById("select3141491994")

  // remove field
  collection.fields.removeById("bool556524030")

  return app.save(collection)
})

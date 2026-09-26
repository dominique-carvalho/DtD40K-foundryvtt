const { BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

/**
 * A feat granted by a race, an exaltation or another feat (spec 005, research R6).
 * `choose`: the player picks the sub-category (e.g. Academy, Tuning).
 * @param {{rank?: boolean}} [options]  rank: the grant needs that Power Stat (exaltations)
 * @returns {SchemaField}
 */
export function grantField({ rank = false } = {}) {
  const fields = {
    name: new StringField({ required: true, blank: false, trim: true }),
    subcategory: new StringField({ required: true, blank: true, trim: true }),
    choose: new BooleanField({ initial: false })
  };
  if (rank) fields.rank = new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 5 });
  return new SchemaField(fields);
}

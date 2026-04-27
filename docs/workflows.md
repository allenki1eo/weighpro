# WeighPro Workflows

## Station desktop workflow

The desktop app is the physical weighbridge control surface.

1. Read the live weight from the XK3190-DS1 indicator.
2. Show whether the reading is stable or unstable.
3. Read the vehicle plate from the ANPR camera.
4. Match the plate to an active session, pending movement note, or previous first weigh.
5. Show the clerk the correct workflow: first weigh, second weigh, manual weigh, or supervisor review.
6. Capture front/rear/cargo photos for evidence.
7. Confirm the stable weight and write a weigh event.
8. Print or store the ticket.

## Web app workflow

The web app is the wider operations and remote work surface.

- Monitor all active vehicle movements.
- Create or import movement notes from business systems.
- Approve remote clerk actions.
- Review camera matches and photos.
- Manage movement types, materials, AMCOS, fuel rates, users, and stations.
- Run reports for finance, procurement, dispatch, stores, and production.

## Movement types

WeighPro tracks workflows by movement type instead of treating every transaction as a simple order.

- Raw cotton receipt
- Raw material receipt
- Finished goods dispatch
- Production transfer
- Lint bale transfer
- Packaging receipt
- Return or empty movement
- Manual weigh

## Raw cotton AMCOS workflow

Raw cotton movements include transport payment data.

1. Clerk or external system creates a raw cotton movement note.
2. The note stores AMCOS, collection point, distance in kilometres, rate per kilometre, and currency.
3. The system calculates `fuel payable = distanceKm * fuelRatePerKm`.
4. Vehicle is weighed in and weighed out.
5. Net cotton weight and fuel payable are available for finance and AMCOS reporting.

## Controls that make the system better

- ANPR plate matching reduces typing and wrong-vehicle tickets.
- Stable-weight lock prevents recording moving scale readings.
- Second-weigh recall prevents clerks from searching manually.
- Photo evidence helps resolve disputes.
- Audit logs capture overrides, edits, approvals, and reprints.
- Remote web access lets approved staff assist even when away from the station.
- AMCOS fuel rates are stored centrally so finance can audit payments.

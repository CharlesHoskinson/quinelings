Review retry advice

After one confirmed unit, does an unknown second attempt allow a retry?

Retain confirmed units and stop retry advice while an attempt is pending or unknown.

The caller supplies the attempt history. The program reviews it and submits no work.

Add an unknown second attempt. The confirmed unit remains; mayRetry changes from true to false.

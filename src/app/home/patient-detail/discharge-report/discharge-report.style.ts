export default `* {
  font-family: Roboto, Helvetica, sans-serif;
  font-weight: 400;
}

html, body {
  margin: 0;
  padding: 10px;
  font-size: 7px;
  -webkit-print-color-adjust: exact;
  box-sizing: border-box;
}

@page {
  size: a4 portrait;
  padding-top: 10px;
}

.report {
  margin: 0;
  position: relative;
  height: 100%;
  width: 100%;
  display: block;
  page-break-after: auto;
  overflow: hidden;
}

.report > div {
  min-width: 0;
}

.patient,
.summary,
.risk-summary,
.review-row,
.current-medications,
.header {
  display: inline-block;
  padding: 10px;
  border: thin solid #888;
  border-radius: 3px;
  width: 100%;
  margin-top: 10px;
  background-color: #fff;
  box-sizing: border-box;
  font-size: 10px;
  page-break-after: auto;
  break-after: auto;
  break-inside: avoid;
}

.report > .header {
  padding: 10px;
  margin: 0;
  display: flex;
  display: -webkit-box;
  display: -webkit-flex;
  flex-wrap: wrap;
  -webkit-flex-wrap: wrap;
  flex-direction: row;
  -webkit-flex-direction: row;
  justify-content: space-around;
  -webkit-justify-content: space-around;
  align-items: center;
  -webkit-align-items: center;
  box-sizing: border-box;
  /* TODO customise */
  background-color: #headerBackground;
}

.report > .header > .logo,
.report > .header > .contact {
  display: flex;
  display: -webkit-box;
  display: -webkit-flex;
  flex-wrap: wrap;
  -webkit-flex-wrap: wrap;
  flex-direction: column;
  -webkit-flex-direction: column;
  justify-content: center;
  -webkit-justify-content: center;
  align-items: center;
  -webkit-align-items: center;
}

.report > .header > .logo {
  width: 50%;
}

.report > .header > .contact {
  width: 50%;
  /* TODO customise */
  color: #headerText;
  align-items: center;
  -webkit-align-items: center;
}

.report > .header > .logo > img {
  max-height: 90px;
}

.report > .header > .contact > p {
  text-align: center;
  margin: 0;
  font-size: 10px;
}

.report > .header > .contact > p.facility-name {
  font-size: 16px;
}

.report .title {
  text-transform: uppercase;
  font-size: 14px;
  margin: 0;
  font-weight: bold;
}

.row {
  width: 100%;
  padding: 0;
  box-sizing: border-box;
  flex-wrap: wrap;
  -webkit-flex-wrap: wrap;
}

.row > .label {
  text-transform: uppercase;
  font-weight: bold;
  margin-bottom: 0;
}

.row > .info {
  margin: 0;
}

.row > .subheading {
  text-transform: uppercase;
  font-size: 10px;
  margin-bottom: 5px;
  font-weight: bold;
}

.row > ul {
  margin-top: 0;
}

.report > .patient > .patient-details,
.report > .patient > .patient-details-diagnosis-urn,
.report > .summary > .summary-details {
  display: flex;
  display: -webkit-box;
  display: -webkit-flex;
  flex-wrap: wrap;
  -webkit-flex-wrap: wrap;
  flex-direction: row;
  -webkit-flex-direction: row;
  justify-content: flex-start;
  -webkit-justify-content: flex-start;
  align-items: flex-start;
  -webkit-align-items: flex-start;
}

.report > .patient > .patient-details > .patient-details-name {
  width: 40%;
}

.report > .patient > .patient-details > .patient-details-born {
  width: 24%;
}

.report > .patient > .patient-details > .patient-details-gender {
  width: 14%;
}

.report > .patient > .patient-details > .patient-details-phone {
  width: 22%;
}

.report > .patient > .patient-details-diagnosis-urn > .patient-diagnosis {
  width: 78%;
}

.report > .patient > .patient-details-diagnosis-urn > .patient-urn {
  width: 22%;
}

.report > .summary > .summary-details > .summary-details-start {
  width: 50%;
}

.report > .summary > .summary-details > .summary-details-end {
  width: 50%;
}

table, th, td {
  border: thin solid #bbb;
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
  margin-top: 10px;
}

table th {
  /* TODO customise */
  background-color: #tableHeaderBackground;
  padding: 5px;
}

table > th, td {
  padding: 5px;
}

td.value-cell {
  text-align: right;
}

td.value-cell.change-cell {
  font-weight: bold;
}

td.text-cell {
  font-weight: bold;
}

td.topics {
  font-weight: bold;
}

.username-date {
  font-weight: bold;
}`;

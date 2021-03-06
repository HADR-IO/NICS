/*
 * Copyright (c) 2008-2021, Massachusetts Institute of Technology (MIT)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package edu.mit.ll.em.api.rs.impl;

import edu.mit.ll.nics.common.entity.ReportLatest;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeoutException;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.AlreadyClosedException;

import org.apache.commons.io.FileUtils;

import org.apache.cxf.jaxrs.ext.multipart.Attachment;
import org.apache.cxf.jaxrs.ext.multipart.MultipartBody;

import org.json.JSONException;
import org.json.JSONObject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;

import edu.mit.ll.nics.common.entity.Form;
import edu.mit.ll.nics.common.entity.FormType;
import edu.mit.ll.nics.common.entity.Location;
import edu.mit.ll.nics.common.entity.Incident;
import edu.mit.ll.nics.common.entity.User;
import edu.mit.ll.nics.common.entity.Image;
import edu.mit.ll.nics.common.entity.Uxoreport;
import edu.mit.ll.nics.common.rabbitmq.RabbitFactory;
import edu.mit.ll.nics.common.rabbitmq.RabbitPubSubProducer;

import edu.mit.ll.em.api.dataaccess.EntityCacheMgr;
import edu.mit.ll.em.api.dataaccess.ICSDatastoreException;
import edu.mit.ll.em.api.exception.BadContentException;
import edu.mit.ll.em.api.rs.QueryConstraintHelper;
import edu.mit.ll.em.api.rs.Report;
import edu.mit.ll.em.api.rs.ReportOptParms;
import edu.mit.ll.em.api.rs.ReportService;
import edu.mit.ll.em.api.rs.ReportServiceResponse;
import edu.mit.ll.em.api.util.APIConfig;
import edu.mit.ll.nics.common.constants.SADisplayConstants;


import edu.mit.ll.nics.nicsdao.impl.*;
import org.springframework.dao.DataAccessException;

/**
 * @AUTHOR sa23148
 */
public class ReportServiceImpl implements ReportService {

    /**
     * Logger
     */
    private static final Logger log = LoggerFactory.getLogger(ReportServiceImpl.class);

    private static final IncidentDAOImpl incidentDao = new IncidentDAOImpl();
    private static final UserDAOImpl userDao = new UserDAOImpl();
    private static final FormDAOImpl formDao = new FormDAOImpl();
    private static final UserSessionDAOImpl userSessDao = new UserSessionDAOImpl();
    private static final UxoreportDAOImpl uxoreportDao = new UxoreportDAOImpl();

    private static final String FORM_TYPE_EXCEPTION = "Exception getting form type id.";
    private static final String FAILED_TO_READ_REPORTS = "Failed to read reports.";
    private static final String INVALID_FORM_ENTITY = "Invalid form entity.";
    private static final String INVALID_FORM_TYPE = "Invalid report type.";
    private static final String PERSIST_REPORT_ERROR = "An error occurred while persisting report.";

    private RabbitPubSubProducer rabbitProducer = null;


    /**
     * Read and return all Report items.
     *
     * @return Response
     *
     * @see ReportServiceResponse
     */
    public Response getReports(int incidentId, String reportType, ReportOptParms optParms) {
        // Make sure we support this type of form.
        Response response = validateReportType(reportType, "GET");
        if(response != null) {
            return response;
        }
        // Provide some reasonable defaults where needed.
        if(optParms.getDateColumn() == null) {
            optParms.setDateColumn("seqtime");
        }
        if(optParms.getSortByColumn() == null) {
            optParms.setSortByColumn("seqtime");
        }
        if(optParms.getSortOrder() == null) {
            optParms.setSortOrder("DESC");
        }
        int maxRowsLimit = APIConfig.getInstance().getConfiguration().getInt(APIConfig.DB_MAX_ROWS, 1000);
        if(optParms.getLimit() == null || optParms.getLimit() > maxRowsLimit) {
            log.debug("Rewriting max. rows LIMIT as {}", maxRowsLimit);
            optParms.setLimit(maxRowsLimit);
        }

        // Collect optional parameters common to all resources.
        Map<String, Object> queryConstraints = QueryConstraintHelper.parseOptions(optParms);
        queryConstraints.put(SADisplayConstants.INCIDENT_ID, incidentId);
        queryConstraints.put(SADisplayConstants.COLLAB_ROOM_ID, optParms.getCollabroomId());

        ReportServiceResponse reportResponse = new ReportServiceResponse();
        int formTypeId = -1;
        try {
            FormType ft = EntityCacheMgr.getInstance().getFormTypeByName(reportType);
            formTypeId = ft.getFormTypeId();
        } catch(ICSDatastoreException e) {
            log.error("Exception getting formTypeId for type({}): {}", reportType, e.getMessage(), e);
            reportResponse.setMessage(FORM_TYPE_EXCEPTION);

            return Response.ok(reportResponse).status(Status.INTERNAL_SERVER_ERROR).build();
        }

        try {
            List<Integer> formTypeIds = new ArrayList<Integer>();
            formTypeIds.add(formTypeId);
            List<Form> forms = formDao.readForms(formTypeIds, queryConstraints);
            reportResponse.setReports(forms);
            reportResponse.setMessage(Status.OK.getReasonPhrase());
            reportResponse.setCount(reportResponse.getReports().size());
            response = Response.ok(reportResponse).status(Status.OK).build();
        } catch(Exception e) {
            e.printStackTrace();
            reportResponse.setMessage(FAILED_TO_READ_REPORTS);
            log.error("Datastore exception, failed to read " +
                    "reports for incidentid " + incidentId + " of form type " + reportType);
            response = Response.ok(reportResponse).status(Status.INTERNAL_SERVER_ERROR).build();
        }
        return response;
    }

    @Override
    public Response getLatestReportPerUser(int incidentId, String reportType) {

        ReportServiceResponse reportServiceResponse = new ReportServiceResponse();
        List<ReportLatest> reports = new ArrayList<>();
        Status status = null;
        try {
            reports = formDao.getLatestReportPerUser(incidentId, reportType);
            if(reports != null) {
                reportServiceResponse.setLatestPerUser(reports);
                reportServiceResponse.setMessage("Success");
                reportServiceResponse.setCount(reports.size());
                status = Status.OK;
            } else {
                reportServiceResponse.setMessage("Fail");
                status = Status.INTERNAL_SERVER_ERROR;
            }
        } catch(DataAccessException e) {
            log.error("Error fetching latest reports per user", e);
            reportServiceResponse.setMessage("Failed");
            status = Status.INTERNAL_SERVER_ERROR;
        }

        return Response.ok(reportServiceResponse).status(status).build();
    }

    /**
     * Delete all Report items. This is an unsupported operation. Response ReportResponse
     */
    public Response deleteReports(int reportType) {
        return makeUnsupportedOpRequestResponse();
    }

    /**
     * Bulk creation of Report items. A collection of Report items to be created. Response ReportResponse
     */
    public Response putReports(int reportType, Collection<Report> reports) {
        // TODO: Needs implementation.
        return makeUnsupportedOpRequestResponse();
    }

    /**
     * Bulk creation of Form entities
     *
     * @param forms
     * @return
     */
    public Response postReports(Collection<Form> forms) {
        return makeUnsupportedOpRequestResponse();
    }


    /**
     * Persists a single Form entity. If the Form has a valid and existing formid, it is updated. Otherwise, it is
     * persisted as a new form.
     *
     * @param form Form to update/persist
     * @return
     */
    public Response postReport(int incidentId, String reportType, Form form) {
        ReportServiceResponse reportServiceResponse = new ReportServiceResponse();

        if(form == null) {
            reportServiceResponse.setMessage(INVALID_FORM_ENTITY);
            return Response.ok(reportServiceResponse).status(Status.BAD_REQUEST).build();
        }

        log.debug("postReport got report:\nincidentId: {}\nreportType: {}\nForm:\n{}",
                incidentId, reportType, form.toString());
        FormType formType = null;
        try {
            formType = EntityCacheMgr.getInstance().getFormTypeByName(reportType);
        } catch(NullPointerException e) {
            log.error("Exception retrieving FormType by name: {}", reportType, e);
        } catch(ICSDatastoreException e) {
            log.error("Exception retrieving FormType by name: {}", reportType, e);
        }

        if(formType == null) {
            reportServiceResponse.setMessage(INVALID_FORM_TYPE);
            return Response.ok(reportServiceResponse).status(Status.BAD_REQUEST).build();
        }

        // Enforce the formtype posted
        form.setFormtypeid(formType.getFormTypeId());

        Response response = null;
        String valid = null;
        String responseMessage = "";

        valid = validateForm(form);
        if(!valid.isEmpty()) {

            responseMessage += valid;
            reportServiceResponse.setMessage(responseMessage);
            response = Response.ok(reportServiceResponse).status(Status.EXPECTATION_FAILED).build();

        } else {

            Form affected = null;

            try {
                form.setSeqtime(Calendar.getInstance().getTimeInMillis());
                affected = formDao.persistForm(form);
            } catch(Exception e) {
                e.printStackTrace();
                responseMessage += e.getMessage();
            }

            if(affected != null) {
                reportServiceResponse.setMessage(responseMessage);
                reportServiceResponse.setCount(1);
                reportServiceResponse.getReports().add(affected);
                response = Response.ok(reportServiceResponse).status(Status.OK).build();

                // Since it was successful, also send it out to new users, except now any persist/create calls
                // to dao need to return the new fully formed form, with formid and everything...
                try {
                    String topic = String.format("iweb.NICS.incident.%d.report.%s.new", affected.getIncidentid(),
                            formType.getFormTypeName());
                    notifyNewReport(topic, affected);
                } catch(IOException e) {
                    log.error("Exception publishing new form with type id: {}",
                            form.getFormtypeid(), e);
                } catch(AlreadyClosedException e) {
                    log.error("Exception RabbitMQ attempting to use a closed channel ", e);
                } catch(Exception e) {
                    log.error("Exception RabbitMQ exception occurred.", e);
                }
            } else {
                reportServiceResponse.setMessage(PERSIST_REPORT_ERROR);
                response = Response.ok(reportServiceResponse).status(Status.EXPECTATION_FAILED).build();
            }
        }

        return response;
    }


    // TODO: better to return json with a boolean and the reasons why
    private String validateForm(Form form) {
        StringBuilder sb = new StringBuilder();

        if(form == null) {
            sb.append("Form cannot be null");
            return sb.toString();
        }

        int incidentId = form.getIncidentid();
        if(incidentId < 0) {
            sb.append(" incidentId(" + incidentId + ") is not valid");
        } else {
            try {
                if(EntityCacheMgr.getInstance().getIncidentEntity(incidentId) == null) {
                    sb.append(" incidentId(" + incidentId + ") is not valid ");
                }
            } catch(Exception e) {
                sb.append(" error validating incidentId: " + e.getMessage());
            }
        }

        int formTypeId = form.getFormtypeid();
        if(formTypeId < 0) {
            sb.append(" formTypeId(" + formTypeId + ") is not valid");
        } else {
            try {
                if(EntityCacheMgr.getInstance().getFormTypeById(formTypeId) == null) {
                    sb.append(" formTypeId(" + formTypeId + ") is not valid");
                }
            } catch(Exception e) {
                sb.append(" error validating formTypeId: " + e.getMessage());
            }
        }

        int userSessionId = form.getUsersessionid();
        if(!userSessDao.userSessionIdExists(userSessionId)) {
            sb.append(" UserSessionId(" + userSessionId + ") not found");
        }

        return (sb.toString().isEmpty()) ? "" : "Form validation failed: " + sb.toString();
    }

    /**
     * Creation of a single Report item. A collection of Report items to be created. Response ReportResponse
     */
    @Deprecated
    public Response postReports(int incidentId, int reportType, Report report) {

        return makeUnsupportedOpRequestResponse();
		/*
		// Make sure we support this type of form.
		Response response = validateReportType(reportType, "POST");
		if (response != null) {
			return response;
		}

		List<Report> reports = new ArrayList<Report>();
		ReportServiceResponse reportResponse = new ReportServiceResponse();
		int formTypeId = -1;
		try {
			FormType ft = EntityCacheMgr.getInstance().getFormTypeById(reportType);
			formTypeId = ft.getFormTypeId();
		} catch (ICSDatastoreException e) {
			log.error(e.getMessage());
			reportResponse.setMessage("Failure. " + e.getMessage());
			reportResponse.setCount(0);
			response = Response.ok(reportResponse).status(Status.PRECONDITION_FAILED).build();
			return response;
		}
		
		try {
			// TODO:1209 workspaceId was changed to incidentId		
			reports.add(ReportDAO.getInstance().postReport(incidentId, formTypeId, report));
			
			reportResponse.setMessage("ok");
			reportResponse.setCount(reports.size());
			reportResponse.setReports(reports);
			response = Response.ok(reportResponse).status(Status.OK).build();			
		} catch (ICSDatastoreException e) {
			log.error(e.getMessage());
			reportResponse.setMessage("Datastore exception, failed to publish form.");
			response = Response.ok(reportResponse).status(Status.INTERNAL_SERVER_ERROR).build();			
		}
		return response;*/
    }


    public Response postReports(int incidentId, String reportType, MultipartBody body) {
        Response response = validateReportType(reportType, "POST");
        ReportServiceResponse reportResponse = new ReportServiceResponse();

        int formTypeId = -1;
        FormType ft = null;
        try {
            ft = EntityCacheMgr.getInstance().getFormTypeByName(reportType);
            formTypeId = ft.getFormTypeId();
        } catch(ICSDatastoreException e) {
            reportResponse.setMessage(Status.EXPECTATION_FAILED.getReasonPhrase());
            log.error("Unhandled exception posting report type {} to incident with ID {}",
                    reportType, incidentId, e);
            reportResponse.setMessage("Failure. " + e.getMessage());
            reportResponse.setCount(0);
            response = Response.ok(reportResponse).status(Status.PRECONDITION_FAILED).build();
            return response;
        }
        try {
            if(ft.getFormTypeName().toUpperCase().equals("SR")) {
                return handleSimpleReport(incidentId, formTypeId, body);
            } else if(ft.getFormTypeName().toUpperCase().equals("DMGRPT")) {
                return handleDamageReport(incidentId, formTypeId, body);
            } else if(ft.getFormTypeName().toUpperCase().equals("UXO")) {
                return handleUXOReport(incidentId, formTypeId, body);
            } else if(ft.getFormTypeName().toUpperCase().equals("EOD")) {
                return handleEODReport(incidentId, formTypeId, body);
            }
        } catch(BadContentException e) {
            log.error("Bad content", e);
            reportResponse.setMessage(Status.EXPECTATION_FAILED.getReasonPhrase());
            reportResponse.setCount(0);
            response = Response.ok(reportResponse).status(Status.BAD_REQUEST).build();
            return response;
        } catch(JSONException e) {
            log.error("JSON exception", e);
            reportResponse.setMessage(Status.EXPECTATION_FAILED.getReasonPhrase());
            reportResponse.setMessage("Failure. " + e.getMessage());
            reportResponse.setCount(0);
            response = Response.ok(reportResponse).status(Status.INTERNAL_SERVER_ERROR).build();
            return response;
        } catch(Exception e) {
            log.error("Unhandled exception handling report", e);
            reportResponse.setMessage(Status.EXPECTATION_FAILED.getReasonPhrase());
            reportResponse.setCount(0);
            response = Response.ok(reportResponse).status(Status.PRECONDITION_FAILED).build();
            return response;
        }

        return response;
    }

    /**
     * Read a single Report item. ID of Report item to be read. Response ReportResponse
     */
    public Response getReport(int reportType, int reportId, String fields) {
        // TODO: Needs implementation.
        return makeUnsupportedOpRequestResponse();
    }

    /**
     * Delete a single Report item. ID of Report item to be read. Response ReportResponse
     */
    public Response deleteReport(int reportType, int reportId) {
        // TODO: Needs implementation.
        return makeUnsupportedOpRequestResponse();
    }

    /**
     * Update a single Report item. ID of Report item to be read. Response ReportResponse
     */
    public Response putReport(int reportType, int reportId, Report report) {
        // TODO: Needs implementation.
        return makeUnsupportedOpRequestResponse();
    }

    /**
     * Post a single Report item. This is an illegal operation. ID of Report item to be read. Response ReportResponse
     */
    public Response postReport(int reportType, int reportId) {
        // Illegal as per RESTful guidelines.
        return makeIllegalOpRequestResponse();
    }

    /**
     * Return the number of Report items stored. Response ReportResponse
     */
    public Response getReportCount(int reportType) {
        // TODO: Needs implementation.
        return makeUnsupportedOpRequestResponse();
    }


    /**
     * Search the Report items stored. Response ReportResponse
     */
    public Response searchReportResources(int reportType, ReportOptParms optParms) {
        // TODO: Needs implementation.
        return makeUnsupportedOpRequestResponse();
    }

    private Response makeIllegalOpRequestResponse() {
        ReportServiceResponse reportResponse = new ReportServiceResponse();
        reportResponse.setMessage("Request ignored.");
        Response response = Response.notModified("Illegal operation requested").
                status(Status.FORBIDDEN).build();
        return response;
    }

    private Response makeUnsupportedOpRequestResponse() {
        ReportServiceResponse reportResponse = new ReportServiceResponse();
        reportResponse.setMessage("Request ignored.");
        Response response = Response.notModified("Unsupported operation requested").
                status(Status.NOT_IMPLEMENTED).build();
        return response;
    }

    private Response validateReportType(String reportType, String htmlOp) {
        Response response = null;
        ReportServiceResponse reportResponse = new ReportServiceResponse();

        try {
            FormType ft = EntityCacheMgr.getInstance().getFormTypeByName(reportType);
            if(ft == null) {
                Set<String> validTypes = EntityCacheMgr.getInstance().getFormTypeNames();
                StringBuilder sb = new StringBuilder();
                sb.append("Failure. Report type [").append(reportType)
                        .append("] not supported. Valid types are [")
                        .append(org.apache.commons.lang.StringUtils.join(validTypes, ","))
                        .append("].");
                log.error(sb.toString());
                reportResponse.setMessage(sb.toString());
                reportResponse.setCount(0);
                response = Response.ok(reportResponse).status(Status.BAD_REQUEST).build();
            }
        } catch(NullPointerException e) {
            log.error("Missing reportType URI argument.", e);
            reportResponse.setMessage(Status.EXPECTATION_FAILED.getReasonPhrase());
            reportResponse.setCount(0);
            response = Response.ok(reportResponse).status(Status.BAD_REQUEST).build();
        } catch(ICSDatastoreException e) {
            log.error("Data store exception checking reportType: {}", reportType, e);
            reportResponse.setMessage(Status.EXPECTATION_FAILED.getReasonPhrase());
            reportResponse.setCount(0);
            response = Response.ok(reportResponse).status(Status.BAD_REQUEST).build();
        } catch(Exception e) {
            log.error("Unhandled exception validating report type: {}", reportType, e);
            reportResponse.setMessage(Status.EXPECTATION_FAILED.getReasonPhrase());
            reportResponse.setCount(0);
            response = Response.ok(reportResponse).status(Status.BAD_REQUEST).build();
        }

        return response;
    }

    private Response handleSimpleReport(int incidentId,
                                        int formTypeId, MultipartBody body) throws JSONException,
            BadContentException {
        Response response = null;
        ReportServiceResponse reportResponse = new ReportServiceResponse();

        List<Attachment> attachments = body.getAllAttachments();
        String key, value;

        String storagePath = APIConfig.getInstance().getConfiguration().getString(APIConfig.REPORTS_SR_STORAGEPATH,
                "/opt/data/nics/reports/general/");
        String url = APIConfig.getInstance().getConfiguration().getString(APIConfig.REPORTS_SR_URL,
                "/data/nics/static/upload/reports/general/");
        String path = APIConfig.getInstance().getConfiguration().getString(APIConfig.REPORTS_SR_PATH,
                "https://<webserver>/static/reports/general/");

        Location location = new Location();
        location.setTime(-1);

        // Other necessary entities
        Incident inc = null;
        User user = null;
        Coordinate lla = new Coordinate();
        Report report = new Report();
        Form form = new Form();
        form.setIncidentid(incidentId);
        form.setFormtypeid(formTypeId);
        form.setUsersessionid(-1);
        JSONObject msg = new JSONObject();
        String filename;
        String ext = ".png";
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);

        for(Attachment a : attachments) {
            MediaType type = a.getContentType();

            if(type.getType().contains("text")) {
                key = a.getContentDisposition().getParameter("name");
                value = a.getObject(String.class);

                if(key.equalsIgnoreCase("incidentid")) {
                    report.setIncidentId(Integer.parseInt(value));
                    //inc = db.readIncident(report.getIncidentId());
                    inc = incidentDao.getIncident(report.getIncidentId());
                } else if(key.equalsIgnoreCase("collabroomId")) {
                    form.setCollabroomid(Integer.parseInt(value));
                } else if(key.equalsIgnoreCase("userid")) {
                    location.setUserid(Integer.parseInt(value));
                    //user = db.readUser(location.getUserid());
                    user = userDao.getUserById(location.getUserid());
                    if(form.getUsersessionid() < 0) {
                        form.setUsersessionid(userSessDao.getUserSessionid(Integer.parseInt(value)));
                    }
                    report.setSenderUserId(user.getUserId());
                    msg.put("user", user.getUsername());
                } else if(key.equalsIgnoreCase("usersessionid")) {
                    int usersessid = Integer.parseInt(value);
                    user = userDao.getUserBySessionId(usersessid);
                    location.setUserid(user.getUserId());
                    report.setUserSessionId(Integer.parseInt(value));
                    if(usersessid > 0 && form.getUsersessionid() < 0) {
                        // Set the usersessionid if it's valid and not already set
                        form.setUsersessionid(usersessid);
                    }
                    report.setSenderUserId(user.getUserId());
                    msg.put("user", user.getUsername());

                } else if(key.equalsIgnoreCase("deviceid")) {
                    location.setDeviceId(value);
                } else if(key.equalsIgnoreCase("latitude")) {
                    lla.y = Double.parseDouble(value);
                    msg.put("lat", lla.y);
                } else if(key.equalsIgnoreCase("longitude")) {
                    lla.x = Double.parseDouble(value);
                    msg.put("lon", lla.x);
                } else if(key.equalsIgnoreCase("altitude")) {
                    lla.z = Double.parseDouble(value);
                } else if(key.equalsIgnoreCase("track")) {
                    location.setCourse(Double.parseDouble(value));
                } else if(key.equalsIgnoreCase("speed")) {
                    location.setSpeed(Double.parseDouble(value));
                } else if(key.equalsIgnoreCase("accuracy")) {
                    location.setAccuracy(Double.parseDouble(value));
                } else if(key.equalsIgnoreCase("description")) {
                    msg.put("desc", value);
                } else if(key.equalsIgnoreCase("category")) {
                    msg.put("cat", value);
                }
            } else {
                filename = Calendar.getInstance().getTimeInMillis() + "-0" + ext;
                msg.put("image", filename);

                byte[] content = a.getObject(byte[].class);
                if(content != null) {
                    // Write to file
                    File f = new File(storagePath.concat(filename));
                    try {
                        FileUtils.writeByteArrayToFile(f, content);
                        msg.put("image", url.concat(filename));
                        msg.put("fullpath", path.concat(filename));
                    } catch(IOException e) {
                        throw new BadContentException("Unable to write file: " + e.getMessage());
                    }
                } else {
                    throw new BadContentException("No attachment");
                }
            }
        }

        location.setTime(Calendar.getInstance().getTimeInMillis());

        report.setSeqTime(location.getTime());
        report.setMessage(msg.toString());

        form.setSeqtime(location.getTime());
        form.setMessage(msg.toString());

        // Set DB orm
        if(!validLocation(lla)) {
            lla.x = inc.getLon();
            lla.y = inc.getLat();
            lla.z = 0;
        }
        location.setLocation(gf.createPoint(lla));

        Image image = new Image();
        image.setIncident(inc);
        image.setLocation(location);
        image.setUrl(msg.getString("image"));
        image.setFullPath(msg.getString("fullpath"));

        try {

            Form ret = null;
            ret = formDao.persistForm(form);

            if(ret != null) {
                reportResponse.setCount(1);
                reportResponse.setMessage(Status.OK.getReasonPhrase());
                reportResponse.getReports().add(ret);
                response = Response.ok(reportResponse).status(Status.OK).build();
                try {
                    String topic = String.format("iweb.NICS.incident.%d.report.SR.new", form.getIncidentid());
                    notifyNewReport(topic, ret);
                } catch(IOException e) {
                    log.error("Exception publishing new form with type id: {}",
                            form.getFormtypeid(), e);
                } catch(AlreadyClosedException e) {
                    log.error("Exception RabbitMQ attempting to use a closed channel ", e);
                } catch(Exception e) {
                    log.error("Exception RabbitMQ exception occurred.", e);
                }
            } else {
                reportResponse.setCount(0);
                reportResponse.setMessage(PERSIST_REPORT_ERROR);
                response = Response.ok(reportResponse).status(Status.EXPECTATION_FAILED).build();
            }
        } catch(ICSDatastoreException e) {
            reportResponse.setMessage(e.getMessage());
            response = Response.ok(reportResponse).status(Status.NOT_FOUND).build();
        } catch(Exception e) {
            reportResponse.setMessage(e.getMessage());
            response = Response.ok(reportResponse).status(Status.EXPECTATION_FAILED).build();
        }

        return response;
    }

    private Response handleDamageReport(int incidentId, int formTypeId, MultipartBody body) throws JSONException,
            BadContentException {

        Response response = null;
        ReportServiceResponse reportResponse = new ReportServiceResponse();

        List<Attachment> attachments = body.getAllAttachments();
        String key, value;

        String storagePath = APIConfig.getInstance().getConfiguration().getString(APIConfig.REPORTS_DR_STORAGEPATH,
                "/opt/data/nics/upload/reports/damage/");
        String url = APIConfig.getInstance().getConfiguration().getString(APIConfig.REPORTS_DR_URL,
                "/data/nics/static/upload/reports/damage/");
        String path = APIConfig.getInstance().getConfiguration().getString(APIConfig.REPORTS_DR_PATH,
                "https://<webserver>/static/reports/damage/");

        Location location = new Location();
        location.setTime(-1);

        // Other necessary entities
        Incident inc = null;
        User user = null;
        Coordinate lla = new Coordinate();
        Form form = new Form();
        form.setIncidentid(incidentId);
        form.setFormtypeid(formTypeId);
        form.setUsersessionid(-1);
        String filename;
        String ext = ".png";
        JSONObject msg = new JSONObject();
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);

        for(Attachment a : attachments) {
            MediaType type = a.getContentType();

            if(type.getType().contains("text")) {
                key = a.getContentDisposition().getParameter("name");
                value = a.getObject(String.class);

                if(key.equalsIgnoreCase("incidentid")) {
                    //report.setIncidentId(Integer.parseInt(value));

                    //inc = incidentDao.getIncident(report.getIncidentId());
                    inc = incidentDao.getIncident(incidentId);
                } else if(key.equalsIgnoreCase("userid")) {
                    //location.setUserid(Integer.parseInt(value));
                    //user = db.readUser(location.getUserid());

                    // Removed this section because grabbing userid from currenusersessionid

                    //user = userDao.getUserById(location.getUserid());
                    //int usersessid = userSessDao.getUserSessionid(location.getUserid());
                    //if(usersessid > 0 && form.getUsersessionid() < 0) {
                    //form.setUsersessionid(usersessid);
                    //}
                    //report.setSenderUserId(user.getUserId());
                } else if(key.equalsIgnoreCase("usersessionid")) {
                    //report.setUserSessionId(Integer.parseInt(value));
                    if(Integer.parseInt(value) > 0 && form.getUsersessionid() < 0) {
                        form.setUsersessionid(Integer.parseInt(value));
                    }
                    user = userDao.getUserBySessionId(Long.parseLong(value));
                    location.setUserid(user.getUserId());

                } else if(key.equalsIgnoreCase("deviceid")) {
                    location.setDeviceId(value);
                } else if(key.equalsIgnoreCase("msg")) {
                    if(msg.has("dr-D-image")) {
                        JSONObject temp = msg;
                        msg = new JSONObject(value);
                        msg.put("dr-D-image", temp.get("dr-D-image"));
                        msg.put("dr-D-fullPath", temp.get("dr-D-fullPath"));
                        temp = null;
                    } else {
                        msg = new JSONObject(value);
                    }

                }

            } else {
                filename = Calendar.getInstance().getTimeInMillis() + "-0" + ext;
                msg.put("dr-D-image", filename);

                byte[] content = a.getObject(byte[].class);
                if(content != null) {
                    // Write to file
                    File f = new File(storagePath.concat(filename));
                    try {
                        FileUtils.writeByteArrayToFile(f, content);
                        msg.put("dr-D-image", url.concat(filename));
                        msg.put("dr-D-fullPath", path.concat(filename));
                    } catch(IOException e) {
                        throw new BadContentException("Unable to write file: " + e.getMessage());
                    }
                } else {
                    throw new BadContentException("No attachment");
                }
            }
        }

        lla.x = msg.getDouble("dr-B-propertyLongitude");
        lla.y = msg.getDouble("dr-B-propertyLatitude");
        lla.z = 0;
        location.setCourse(0.0);
        location.setSpeed(0.0);
        location.setAccuracy(0.0);

        msg.put("user", user.getUsername());
        msg.put("userfull", user.getFirstname() + " " + user.getLastname());
        location.setTime(Calendar.getInstance().getTimeInMillis());
        //report.setSeqTime(location.getTime());
        //report.setMessage(msg.toString());
        form.setSeqtime(location.getTime());
        form.setMessage(msg.toString());

        // Set DB orm
        if(!validLocation(lla)) {
            lla.x = inc.getLon();
            lla.y = inc.getLat();
            lla.z = 0;
        }
        location.setLocation(gf.createPoint(lla));

        Image image = new Image();
        image.setIncident(inc);
        image.setLocation(location);
        image.setUrl(msg.getString("dr-D-image"));
        image.setFullPath(msg.getString("dr-D-fullPath"));

        try {

            Form ret = formDao.persistForm(form);

            if(ret != null) {
                reportResponse.getReports().add(ret);
                reportResponse.setCount(1);
                reportResponse.setMessage("ok");
                response = Response.ok(reportResponse).status(Status.OK).build();

                try {
                    String topic = String.format("iweb.NICS.incident.%d.report.DMGRPT.new", form.getIncidentid());
                    notifyNewReport(topic, ret);
                } catch(IOException e) {
                    log.error("Exception publishing new form with type id: {}",
                            form.getFormtypeid(), e);
                } catch(AlreadyClosedException e) {
                    log.error("Exception RabbitMQ attempting to use a closed channel ", e);
                } catch(Exception e) {
                    log.error("Exception RabbitMQ exception occurred.", e);
                }

            } else {
                reportResponse.setCount(0);
                reportResponse.setMessage(PERSIST_REPORT_ERROR);
                response = Response.ok(reportResponse).status(Status.EXPECTATION_FAILED).build();
            }

        } catch(ICSDatastoreException e) {
            reportResponse.setMessage(e.getMessage());
            response = Response.ok(reportResponse).status(Status.NOT_FOUND).build();
        } catch(Exception e) {
            reportResponse.setMessage(e.getMessage());
            response = Response.ok(reportResponse).status(Status.EXPECTATION_FAILED).build();
        }

        return response;
    }

    private Response handleEODReport(int incidentId,
                                     int formTypeId, MultipartBody body) throws JSONException,
            BadContentException {
        Response response = null;
        ReportServiceResponse reportResponse = new ReportServiceResponse();

        List<Attachment> attachments = body.getAllAttachments();
        String key, value;

        String storagePath = APIConfig.getInstance().getConfiguration().getString(APIConfig.REPORTS_EOD_STORAGEPATH,
                "/opt/data/nics/reports/eod/");
        String url = APIConfig.getInstance().getConfiguration().getString(APIConfig.REPORTS_EOD_URL,
                "/data/nics/static/upload/reports/eod/");
        String path = APIConfig.getInstance().getConfiguration().getString(APIConfig.REPORTS_EOD_PATH,
                "https://<webserver>/static/reports/eod/");

        Location location = new Location();
        location.setTime(-1);

        // Other necessary entities
        Incident inc = null;
        User user = null;
        Coordinate lla = new Coordinate();
        Report report = new Report();
        Form form = new Form();
        form.setIncidentid(incidentId);
        form.setFormtypeid(formTypeId);
        form.setUsersessionid(-1);
        JSONObject msg = new JSONObject();
        String filename;
        String ext = ".png";
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);

        for(Attachment a : attachments) {
            MediaType type = a.getContentType();

            if(type.getType().contains("text")) {
                key = a.getContentDisposition().getParameter("name");
                value = a.getObject(String.class);

                if(key.equalsIgnoreCase("incidentid")) {
                    report.setIncidentId(Integer.parseInt(value));
                    //inc = db.readIncident(report.getIncidentId());
                    inc = incidentDao.getIncident(report.getIncidentId());
                } else if(key.equalsIgnoreCase("collabroomId")) {
                    form.setCollabroomid(Integer.parseInt(value));
                } else if(key.equalsIgnoreCase("userid")) {
                    location.setUserid(Integer.parseInt(value));
                    //user = db.readUser(location.getUserid());
                    user = userDao.getUserById(location.getUserid());
                    if(form.getUsersessionid() < 0) {
                        form.setUsersessionid(userSessDao.getUserSessionid(Integer.parseInt(value)));
                    }
                    report.setSenderUserId(user.getUserId());
                    msg.put("user", user.getUsername());
                } else if(key.equalsIgnoreCase("usersessionid")) {
                    int usersessid = Integer.parseInt(value);
                    user = userDao.getUserBySessionId(usersessid);
                    location.setUserid(user.getUserId());
                    report.setUserSessionId(Integer.parseInt(value));
                    if(usersessid > 0 && form.getUsersessionid() < 0) {
                        // Set the usersessionid if it's valid and not already set
                        form.setUsersessionid(usersessid);
                    }
                    report.setSenderUserId(user.getUserId());
                    msg.put("user", user.getUsername());
                } else if(key.equalsIgnoreCase("deviceid")) {
                    location.setDeviceId(value);
                } else if(key.equalsIgnoreCase("latitude")) {
                    lla.y = Double.parseDouble(value);
                    msg.put("lat", lla.y);
                } else if(key.equalsIgnoreCase("longitude")) {
                    lla.x = Double.parseDouble(value);
                    msg.put("lon", lla.x);
                } else if(key.equalsIgnoreCase("altitude")) {
                    lla.z = Double.parseDouble(value);
                } else if(key.equalsIgnoreCase("track")) {
                    location.setCourse(Double.parseDouble(value));
                } else if(key.equalsIgnoreCase("speed")) {
                    location.setSpeed(Double.parseDouble(value));
                } else if(key.equalsIgnoreCase("accuracy")) {
                    location.setAccuracy(Double.parseDouble(value));
                } else if(key.equalsIgnoreCase("description")) {
                    msg.put("desc", value);
                } else if(key.equalsIgnoreCase("team")) {
                    msg.put("team", value);
                } else if(key.equalsIgnoreCase("canton")) {
                    msg.put("canton", value);
                } else if(key.equalsIgnoreCase("town")) {
                    msg.put("town", value);
                } else if(key.equalsIgnoreCase("tasktype")) {
                    msg.put("tasktype", value);
                } else if(key.equalsIgnoreCase("macID")) {
                    msg.put("macID", value);
                } else if(key.equalsIgnoreCase("medevacPointTimeDistance")) {
                    msg.put("medevacPointTimeDistance", value);
                } else if(key.equalsIgnoreCase("contactPerson")) {
                    msg.put("contactPerson", value);
                } else if(key.equalsIgnoreCase("contactPhone")) {
                    msg.put("contactPhone", value);
                } else if(key.equalsIgnoreCase("contactAddress")) {
                    msg.put("contactAddress", value);
                } else if(key.equalsIgnoreCase("remarks")) {
                    msg.put("remarks", value);
                } else if(key.equalsIgnoreCase("expendedResources")) {
                    msg.put("expendedResources", value);
                } else if(key.equalsIgnoreCase("directlyInvolved")) {
                    msg.put("directlyInvolved", value);
                } else if(key.equalsIgnoreCase("uxo")) {
                    msg.put("uxo", value);
                } else if(key.equalsIgnoreCase("imagePath")) {
                    msg.put("imagePath", value);
                }
            } else {
                filename = Calendar.getInstance().getTimeInMillis() + "-0" + ext;
                msg.put("image", filename);

                byte[] content = a.getObject(byte[].class);
                if(content != null) {
                    // Write to file
                    File f = new File(storagePath.concat(filename));
                    try {
                        FileUtils.writeByteArrayToFile(f, content);
                        msg.put("image", url.concat(filename));
                        msg.put("fullPath", path.concat(filename));
                    } catch(IOException e) {
                        throw new BadContentException("Unable to write file: " + e.getMessage());
                    }
                } else {
                    throw new BadContentException("No attachment");
                }
            }
        }

        location.setTime(Calendar.getInstance().getTimeInMillis());

        report.setSeqTime(location.getTime());
        report.setMessage(msg.toString());

        form.setSeqtime(location.getTime());
        form.setMessage(msg.toString());

        // Set DB orm
        if(!validLocation(lla)) {
            lla.x = inc.getLon();
            lla.y = inc.getLat();
            lla.z = 0;
        }
        location.setLocation(gf.createPoint(lla));

        Image image = new Image();
        image.setIncident(inc);
        image.setLocation(location);
        image.setUrl(msg.getString("image"));
        image.setFullPath(msg.getString("fullPath"));

        try {
            Form ret = null;
            ret = formDao.persistForm(form);

            if(ret != null) {
                reportResponse.setCount(1);
                reportResponse.setMessage(Status.OK.getReasonPhrase());
                reportResponse.getReports().add(ret);
                response = Response.ok(reportResponse).status(Status.OK).build();
                try {
                    String topic = String.format("iweb.NICS.incident.%d.report.EOD.new", form.getIncidentid());
                    notifyNewReport(topic, ret);
                } catch(IOException e) {
                    log.error("Exception publishing new form with type id: {}",
                            form.getFormtypeid(), e);
                } catch(AlreadyClosedException e) {
                    log.error("Exception RabbitMQ attempting to use a closed channel ", e);
                } catch(Exception e) {
                    log.error("Exception RabbitMQ exception occurred.", e);
                }
            } else {
                reportResponse.setCount(0);
                reportResponse.setMessage(PERSIST_REPORT_ERROR);
                response = Response.ok(reportResponse).status(Status.EXPECTATION_FAILED).build();
            }
        } catch(ICSDatastoreException e) {
            reportResponse.setMessage(e.getMessage());
            response = Response.ok(reportResponse).status(Status.NOT_FOUND).build();
        } catch(Exception e) {
            reportResponse.setMessage(e.getMessage());
            response = Response.ok(reportResponse).status(Status.EXPECTATION_FAILED).build();
        }

        return response;
    }

    private Response handleUXOReport(int incidentId, int formTypeId, MultipartBody body) throws JSONException,
            BadContentException {

        Response response = null;
        ReportServiceResponse reportResponse = new ReportServiceResponse();

        List<Attachment> attachments = body.getAllAttachments();
        String key, value;

        String storagePath = APIConfig.getInstance().getConfiguration().getString(APIConfig.REPORTS_UXO_STORAGEPATH,
                "/opt/data/nics/upload/reports/uxo/");
        String url = APIConfig.getInstance().getConfiguration().getString(APIConfig.REPORTS_UXO_URL,
                "/data/nics/static/upload/reports/uxo/");
        String path = APIConfig.getInstance().getConfiguration().getString(APIConfig.REPORTS_UXO_PATH,
                "https://<webserver>/static/reports/uxo/");

        Location location = new Location();
        location.setTime(-1);

        // Other necessary entities
        Incident inc = null;
        User user = null;
        Coordinate lla = new Coordinate();
        Form form = new Form();
        form.setIncidentid(incidentId);
        form.setFormtypeid(formTypeId);
        form.setUsersessionid(-1);
        String filename;
        String ext = ".png";
        JSONObject msg = new JSONObject();
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);

        for(Attachment a : attachments) {
            MediaType type = a.getContentType();

            if(type.getType().contains("text")) {
                key = a.getContentDisposition().getParameter("name");
                value = a.getObject(String.class);

                if(key.equalsIgnoreCase("incidentid")) {
                    //report.setIncidentId(Integer.parseInt(value));

                    //inc = incidentDao.getIncident(report.getIncidentId());
                    inc = incidentDao.getIncident(incidentId);
                } else if(key.equalsIgnoreCase("userid")) {
                    //location.setUserid(Integer.parseInt(value));
                    //user = db.readUser(location.getUserid());
                    //user = userDao.getUserById(location.getUserid());
                    //int usersessid = userSessDao.getUserSessionid(location.getUserid());
                    //if(usersessid > 0 && form.getUsersessionid() < 0) {
                    //	form.setUsersessionid(usersessid);
                    //}
                    //report.setSenderUserId(user.getUserId());
                } else if(key.equalsIgnoreCase("usersessionid")) {
                    //report.setUserSessionId(Integer.parseInt(value));
                    if(Integer.parseInt(value) > 0 && form.getUsersessionid() < 0) {
                        form.setUsersessionid(Integer.parseInt(value));
                    }
                    user = userDao.getUserBySessionId(Long.parseLong(value));
                    location.setUserid(user.getUserId());
                } else if(key.equalsIgnoreCase("deviceid")) {
                    location.setDeviceId(value);
                } else if(key.equalsIgnoreCase("msg")) {
                    if(msg.has("ur-image")) {
                        JSONObject temp = msg;
                        msg = new JSONObject(value);
                        msg.put("ur-image", temp.get("ur-image"));
                        msg.put("ur-fullPath", temp.get("ur-fullPath"));
                        temp = null;
                    } else {
                        msg = new JSONObject(value);
                    }

                }

            } else {
                filename = Calendar.getInstance().getTimeInMillis() + "-0" + ext;
                msg.put("ur-image", filename);

                byte[] content = a.getObject(byte[].class);
                if(content != null) {
                    // Write to file
                    File f = new File(storagePath.concat(filename));
                    try {
                        FileUtils.writeByteArrayToFile(f, content);
                        msg.put("ur-image", url.concat(filename));
                        msg.put("ur-fullPath", path.concat(filename));
                    } catch(IOException e) {
                        throw new BadContentException("Unable to write file: " + e.getMessage());
                    }
                } else {
                    throw new BadContentException("No attachment");
                }
            }
        }

        lla.x = msg.getDouble("ur-longitude");
        lla.y = msg.getDouble("ur-latitude");
        lla.z = 0;
        location.setCourse(0.0);
        location.setSpeed(0.0);
        location.setAccuracy(0.0);


        msg.put("user", user.getUsername());
        msg.put("userfull", user.getFirstname() + " " + user.getLastname());
        location.setTime(Calendar.getInstance().getTimeInMillis());

        //report.setSeqTime(location.getTimestamp());
        //report.setMessage(msg.toString());
        form.setSeqtime(location.getTime());
        form.setMessage(msg.toString());

        // Set DB orm
        if(!validLocation(lla)) {
            lla.x = inc.getLon();
            lla.y = inc.getLat();
            lla.z = 0;
        }
        location.setLocation(gf.createPoint(lla));

        Image image = new Image();
        image.setIncident(inc);
        image.setLocation(location);
        image.setUrl(msg.getString("ur-image"));
        image.setFullPath(msg.getString("ur-fullPath"));

        try {
            Form ret = formDao.persistForm(form);

            if(ret != null) {
                reportResponse.getReports().add(ret);
                reportResponse.setCount(1);
                reportResponse.setMessage("ok");
                response = Response.ok(reportResponse).status(Status.OK).build();

                try {
                    String topic = String.format("iweb.NICS.incident.%d.report.UXO.new", form.getIncidentid());
                    notifyNewReport(topic, ret);
                } catch(IOException e) {
                    log.error("Exception publishing new form with type id: {}",
                            form.getFormtypeid(), e);
                } catch(AlreadyClosedException e) {
                    log.error("Exception RabbitMQ attempting to use a closed channel ", e);
                } catch(Exception e) {
                    log.error("Exception RabbitMQ exception occurred.", e);
                }

            } else {
                reportResponse.setCount(0);
                reportResponse.setMessage("Did not successfully persist report!");
                response = Response.ok(reportResponse).status(Status.EXPECTATION_FAILED).build();
            }

        } catch(ICSDatastoreException e) {
            reportResponse.setMessage(Status.EXPECTATION_FAILED.getReasonPhrase());
            response = Response.ok(reportResponse).status(Status.NOT_FOUND).build();
        } catch(Exception e) {
            reportResponse.setMessage(Status.EXPECTATION_FAILED.getReasonPhrase());
            response = Response.ok(reportResponse).status(Status.EXPECTATION_FAILED).build();
        }

        try {
            Uxoreport report = new Uxoreport();
            report.setMessage(msg.toString());
            report.setIncidentid(incidentId);
            report.setLat(lla.y);
            report.setLon(lla.x);

            log.debug("Trying to insert uxoreport");
            uxoreportDao.persistUxoreport(report);
            log.debug("Inserted uxoreport");
        } catch(Exception e) {
            log.error("Exception trying to insert uxoreport", e);
        }


        return response;
    }

    private boolean validLocation(Coordinate lla) {
        return !(lla.x > 180) && !(lla.x < -180) && !(lla.y > 180) && !(lla.y < -180);
    }

    private void notifyNewReport(String topic, Form form) throws IOException, TimeoutException, AlreadyClosedException {
        if(form != null) {
            ObjectMapper mapper = new ObjectMapper();
            String message = mapper.writeValueAsString(form);
            getRabbitProducer().produce(topic, message);
        }
    }


    /**
     * Get Rabbit producer to send message
     *
     * @return
     *
     * @throws IOException
     * @throws AlreadyClosedException
     */
    private RabbitPubSubProducer getRabbitProducer() throws IOException, TimeoutException, AlreadyClosedException {
        if(rabbitProducer == null) {
            rabbitProducer = RabbitFactory.makeRabbitPubSubProducer(
                    APIConfig.getInstance().getConfiguration().getString(APIConfig.RABBIT_HOSTNAME_KEY),
                    APIConfig.getInstance().getConfiguration().getString(APIConfig.RABBIT_EXCHANGENAME_KEY),
                    APIConfig.getInstance().getConfiguration().getString(APIConfig.RABBIT_USERNAME_KEY),
                    APIConfig.getInstance().getConfiguration().getString(APIConfig.RABBIT_USERPWD_KEY));
        }
        return rabbitProducer;
    }

    @Override
    public Response getReportTypes() {
        Response response = null;
        ReportServiceResponse reportServiceResponse = new ReportServiceResponse();

        List<FormType> formTypes = EntityCacheMgr.getInstance().getFormTypes();
        if(formTypes != null) {
            reportServiceResponse.setMessage(Status.OK.getReasonPhrase());
            reportServiceResponse.setTypes(formTypes);
            reportServiceResponse.setCount(formTypes.size());
            response = Response.ok(reportServiceResponse).status(Status.OK).build();
        } else {
            reportServiceResponse.setMessage(Status.EXPECTATION_FAILED.getReasonPhrase());
            response = Response.ok(reportServiceResponse).status(Status.INTERNAL_SERVER_ERROR).build();
        }

        return response;
    }
}


import React from "react";
import ValidateEntity from "../Shared/ValidateEntity";

const ValidFarmer = ({ navigation }) => (
	<ValidateEntity navigation={navigation} idLabelKey="farmerId" headerKey="addFarmerValidation" />
);

export default ValidFarmer;
